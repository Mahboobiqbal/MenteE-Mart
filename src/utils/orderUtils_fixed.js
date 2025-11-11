import supabase from "./supabase";
import { getStoreConfig } from "./storeConfig";

export const createOrder = async (orderData) => {
  try {
    // 1. Create or get customer
    const customer = await createOrGetCustomer(orderData.customer);

    // 2. Generate unique order number
    const orderNumber = await generateOrderNumber();

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

    try {
      const storeConfig = await getStoreConfig(storeName);
      commissionRate = storeConfig.commission_rate || 5.0;
    } catch (error) {
      console.error("Error getting store config, using default commission rate:", error);
    }

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
    commissionAmount = Number(orderData.totalAmount || 0) * (commissionRate / 100);

    // Calculate total amount including shipping
    const totalAmountWithShipping = Number(orderData.totalAmount || 0) + shippingCost;

    // Validate commission values before creating order
    console.log("Commission values before order creation:", {
      commissionRate,
      commissionAmount,
      totalAmount: orderData.totalAmount,
      shippingCost
    });

    // Ensure values are not null or NaN
    if (commissionRate === null || isNaN(commissionRate)) {
      commissionRate = 5.0; // Default fallback
    }

    if (commissionAmount === null || isNaN(commissionAmount)) {
      commissionAmount = 0; // Default fallback
    }

    // 3. Create order
    const { data: order, error: orderError } = await supabase
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
      console.error("Order items creation error:", itemsError);
      throw new Error(
        `Failed to create order items: ${itemsError.message || "Unknown error"}`
      );
    }

    // Return the created order
    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Helper functions
const createOrGetCustomer = async (customerData) => {
  try {
    // Try to find existing customer by email
    const { data: existingCustomer, error: findError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", customerData.email)
      .single();

    if (existingCustomer && !findError) {
      return existingCustomer;
    }

    // Create new customer if not found
    const { data: newCustomer, error: createError } = await supabase
      .from("customers")
      .insert({
        email: customerData.email,
        phone: customerData.phone,
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      throw new Error(
        `Failed to create customer: ${createError.message || "Unknown error"}`
      );
    }

    return newCustomer;
  } catch (error) {
    console.error("Error creating/getting customer:", error);
    throw error;
  }
};

const generateOrderNumber = async () => {
  try {
    // Get current date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // Get today's order count
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${year}-${month}-${day}`);

    // Generate order number (format: MENTE-YYYYMMDD-0001)
    const sequence = String((count || 0) + 1).padStart(4, "0");
    return `MENTE-${year}${month}${day}-${sequence}`;
  } catch (error) {
    console.error("Error generating order number:", error);
    // Fallback to simple timestamp-based number
    return `MENTE-${Date.now()}`;
  }
};

const formatAddress = (customerData) => {
  return `${customerData.addressLine1}, ${customerData.city}, ${customerData.stateProvince} ${customerData.postalCode}, ${customerData.country}`;
};
