import supabase from "./supabase";
import { getStoreConfig } from "./storeConfig";

export const createOrder = async (orderData) => {
  try {
    // 1. Create or get customer
    const customer = await createOrGetCustomer(orderData.customer);

    // 2. Generate unique order number
    let orderNumber = await generateOrderNumber();

    // 3. Determine store_id from the first item (assuming all items are from the same store)
    let storeId = orderData.items[0]?.store_id;

    // If store_id is not available in the cart item, try to fetch it from the database
    if (!storeId && orderData.items[0]?.id) {
      try {
        const { data: product } = await supabase
          .from("products")
          .select("store_id")
          .eq("id", orderData.items[0].id)
          .single();
        storeId = product?.store_id;
      } catch (error) {
        console.warn("Could not fetch store_id from database:", error);
      }
    }

    if (!storeId) {
      // Try to get the first active store as fallback
      try {
        const { data: stores } = await supabase
          .from("stores")
          .select("id")
          .eq("is_active", true)
          .limit(1);
        if (stores && stores.length > 0) {
          storeId = stores[0].id;
        }
      } catch (error) {
        console.warn("Could not fetch default store:", error);
      }
    }

    // Final fallback: use a default store ID if all else fails
    if (!storeId) {
      console.warn("No store ID found, using default store ID");
      storeId = "default-store-id"; // Use a default store ID
    }

    // Log the final store_id for debugging
    console.log("Using store_id:", storeId);

    // Validate that all items are from the same store
    for (const item of orderData.items) {
      const itemStoreId = item.store_id;
      if (itemStoreId && itemStoreId !== storeId) {
        throw new Error(
          "Cannot create order: all items must be from the same store"
        );
      }
    }

    // Get store configuration for commission rate
    const storeName = orderData.items[0]?.store || "MenteE";
    let commissionRate = 5.0; // Default commission rate
    let commissionAmount = 0;

    // Get shipping area and cost
    let shippingCost = 0;
    if (orderData.areaId) {
      try {
        const { data: area } = await supabase
          .from("areas")
          .select("shipping_cost")
          .eq("id", orderData.areaId)
          .single();

        if (area) {
          shippingCost = area.shipping_cost;
          console.log("Shipping cost from area:", shippingCost);
        }
      } catch (error) {
        console.error("Error fetching shipping area:", error);
      }
    }

    // Calculate commission based on subtotal only (excluding shipping)
    commissionAmount =
      Number(orderData.totalAmount || 0) * (commissionRate / 100);

    // Calculate total amount including shipping
    const totalAmountWithShipping =
      Number(orderData.totalAmount || 0) + shippingCost;

    // Calculate commission based on subtotal (excluding shipping)
    commissionAmount =
      Number(orderData.totalAmount || 0) * (commissionRate / 100);

    try {
      const storeConfig = await getStoreConfig(storeName);
      commissionRate = storeConfig.commission_rate || 5.0;
    } catch (error) {
      console.error(
        "Error getting store config, using default commission rate:",
        error
      );
    }

    // Calculate commission based on subtotal only (excluding shipping)
    commissionAmount =
      Number(orderData.totalAmount || 0) * (commissionRate / 100);

    // Validate commission values before creating order
    console.log("Commission values before order creation:", {
      commissionRate,
      commissionAmount,
      totalAmount: orderData.totalAmount,
    });

    // Ensure values are not null or NaN
    if (commissionRate === null || isNaN(commissionRate)) {
      commissionRate = 5.0; // Default fallback
    }

    if (commissionAmount === null || isNaN(commissionAmount)) {
      commissionAmount = 0; // Default fallback
    }

    // 3. Create order with retry mechanism for order number conflicts
    let order = null;
    let orderError = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (!order && retryCount < maxRetries) {
      try {
        const result = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            customer_id: customer.id,
            store_id: storeId,
            store_name: storeName,
            commission_rate: commissionRate,
            commission_amount: commissionAmount,
            store_commission_rate: commissionRate,
            store_commission_amount: commissionAmount,
            commission_status: "pending",
            status: "pending",
            subtotal: orderData.totalAmount,
            tax_amount: 0, // Tax is included in price
            shipping_cost: shippingCost,
            area_id: orderData.areaId,
            net_amount: totalAmountWithShipping, // Net amount includes shipping
            total_amount: totalAmountWithShipping, // Total amount includes shipping
            currency: "PKR",
            customer_email: orderData.customer.email,
            customer_phone: orderData.customer.phone,
            customer_first_name: orderData.customer.firstName,
            customer_last_name: orderData.customer.lastName,
            shipping_address: formatAddress(orderData.customer),
            order_notes: orderData.orderNotes || null,
            payment_method: "easypaisa",
            payment_status: "pending",
          })
          .select()
          .single();

        order = result.data;
        orderError = result.error;
      } catch (error) {
        console.error("Order creation attempt failed:", error);
        orderError = error;
      }

      // If there's a conflict with order number, generate a new one and retry
      const isConflictError = (err) => {
        if (!err) return false;
        // Check for Supabase unique constraint violation
        if (err.code === "23505") return true;
        // Check for HTTP 409 Conflict
        if (err.status === 409) return true;
        // Check error message
        const message = (err.message || "").toLowerCase();
        if (
          message.includes("unique constraint") ||
          message.includes("duplicate")
        )
          return true;
        return false;
      };

      if (orderError && isConflictError(orderError)) {
        if (retryCount < maxRetries) {
          console.log(
            `Order number conflict, retrying (${retryCount + 1}/${maxRetries})`
          );
          console.log("Previous order number:", orderNumber);
          retryCount++;

          // Generate a genuinely new order number
          const newOrderNumber = await generateOrderNumber();
          orderNumber = newOrderNumber;
          console.log("New order number:", orderNumber);

          // Reset error for next iteration
          orderError = null;
          // Continue to next iteration of while loop
        } else {
          // Max retries exceeded, break out
          console.error("Max retries exceeded for order number conflicts");
          break;
        }
      } else {
        // If it's a different error or no error, break out of the loop
        break;
      }
    }

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error(
        `Failed to create order: ${orderError.message || "Unknown error"}`
      );
    }

    // 4. Create order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_sku: item.id, // Using product ID as SKU
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      product_image_url: item.image,
      product_category: item.category,
      product_store: item.store,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      // If order items fail, try to delete the order
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // 5. Create payment record
    const { error: paymentError } = await supabase
      .from("payment_records")
      .insert({
        order_id: order.id,
        payment_method: "easypaisa",
        payment_amount: orderData.totalAmount,
        easypaisa_account_number: getEasypaisaAccountNumber(),
        status: "pending",
      });

    if (paymentError) {
      console.warn("Failed to create payment record:", paymentError);
      // Don't throw here, order is still valid
    }

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const createOrGetCustomer = async (customerData) => {
  try {
    // First, try to find existing customer by email
    // Use .maybeSingle() instead of .single() to avoid error when no customer is found
    const { data: existingCustomer, error: fetchError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", customerData.email)
      .maybeSingle();

    // Handle error if any during fetch
    if (fetchError) {
      console.error("Error fetching customer:", fetchError);
      throw fetchError;
    }

    if (existingCustomer) {
      // Update existing customer with new information
      const { data: updatedCustomer, error: updateError } = await supabase
        .from("customers")
        .update({
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          phone: customerData.phone,
          alternate_phone: customerData.alternatePhone || null,
          address_line1: customerData.addressLine1,
          address_line2: customerData.addressLine2 || null,
          city: customerData.city,
          state_province: customerData.stateProvince,
          postal_code: customerData.postalCode || null,
          country: customerData.country,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCustomer.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update customer: ${updateError.message}`);
      }

      return updatedCustomer;
    } else {
      // Create new customer using upsert to avoid conflicts
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .upsert(
          {
            email: customerData.email,
            first_name: customerData.firstName,
            last_name: customerData.lastName,
            phone: customerData.phone,
            alternate_phone: customerData.alternatePhone || null,
            address_line1: customerData.addressLine1,
            address_line2: customerData.addressLine2 || null,
            city: customerData.city,
            state_province: customerData.stateProvince,
            postal_code: customerData.postalCode || null,
            country: customerData.country,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "email",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create customer: ${createError.message}`);
      }

      return newCustomer;
    }
  } catch (error) {
    console.error("Error creating/getting customer:", error);
    throw error;
  }
};

export const generateOrderNumber = async () => {
  try {
    // Skip the RPC function and use client-side generation for better control
    // Generate a truly unique order number each time
    const timestamp = Date.now();
    const milliseconds = timestamp % 1000; // Last 3 digits of milliseconds
    const randomPart1 = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const randomPart2 = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const orderNumber = `ORD${timestamp
      .toString()
      .slice(-8)}${randomPart1}${randomPart2}${milliseconds}`;

    console.log("Generated order number:", orderNumber);

    // Double-check if the order number already exists in the database
    try {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber)
        .limit(1);

      if (existingOrder && existingOrder.length > 0) {
        console.log("Order number collision detected, generating new one");
        // If collision, recursively generate a new one after a tiny delay
        await new Promise((resolve) => setTimeout(resolve, 50));
        return generateOrderNumber();
      }
    } catch (error) {
      console.warn("Could not check for order number collision:", error);
      // Continue anyway, the database unique constraint will catch duplicates
    }

    return orderNumber;
  } catch (error) {
    console.error("Error generating order number:", error);

    // Absolute last resort fallback - use a completely different format
    const timestamp = Date.now();
    const nanoTime = Math.random().toString(36).substring(2, 20);
    return `O${timestamp}${nanoTime}`.substring(0, 30);
  }
};

export const getOrderByNumber = async (orderNumber) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers(*),
        order_items(*),
        payment_records(*)
      `
      )
      .eq("order_number", orderNumber)
      .single();

    if (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status, adminNotes = null) => {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add specific timestamps based on status
    if (status === "confirmed") {
      updateData.confirmed_at = new Date().toISOString();
    } else if (status === "shipped") {
      updateData.shipped_at = new Date().toISOString();
    } else if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === "cancelled") {
      // Reset commission amounts for cancelled orders
      updateData.commission_amount = 0;
      updateData.store_commission_amount = 0;
    }

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const verifyPayment = async (
  orderId,
  transactionId,
  adminNotes = null
) => {
  try {
    // Update payment record
    const { error: paymentError } = await supabase
      .from("payment_records")
      .update({
        status: "verified",
        transaction_id: transactionId,
        verified_at: new Date().toISOString(),
        admin_notes: adminNotes,
        payment_date: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    if (paymentError) {
      throw new Error(`Failed to verify payment: ${paymentError.message}`);
    }

    // Update order payment status and mark as confirmed
    const { error: orderError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (orderError) {
      throw new Error(`Failed to update order: ${orderError.message}`);
    }

    return true;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

// Helper functions
const formatAddress = (customer) => {
  let address = customer.addressLine1;
  if (customer.addressLine2) {
    address += `, ${customer.addressLine2}`;
  }
  address += `, ${customer.city}`;
  address += `, ${customer.stateProvince}`;
  if (customer.postalCode) {
    address += ` ${customer.postalCode}`;
  }
  return address;
};

const getEasypaisaAccountNumber = () => {
  return import.meta.env.VITE_EASYPAISA_ACCOUNT_NUMBER || "03XX-XXXXXXX";
};

export const getOrderStatusColor = (status) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

export const getOrderStatusText = (status) => {
  const statusTexts = {
    pending: "Pending Payment",
    confirmed: "Order Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return statusTexts[status] || status;
};
