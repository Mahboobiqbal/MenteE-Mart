import supabase from "./supabase";

export const createOrder = async (orderData) => {
  try {
    // 1. Create or get customer
    const customer = await createOrGetCustomer(orderData.customer);

    // 2. Generate unique order number
    const orderNumber = await generateOrderNumber();

    // 3. Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customer.id,
        status: "pending",
        subtotal: orderData.totalAmount,
        tax_amount: 0, // Tax is included in price
        shipping_cost: 0, // Free shipping
        total_amount: orderData.totalAmount,
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
      throw new Error(`Failed to create order: ${orderError.message}`);
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
    const { data: existingCustomer, error: findError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", customerData.email)
      .single();

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
      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert({
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
        })
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
    // Use the database function to generate order number
    const { data, error } = await supabase.rpc("generate_order_number");

    if (error) {
      // Fallback to client-side generation
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `ORD${timestamp.toString().slice(-6)}${random}`;
    }

    return data;
  } catch (error) {
    console.error("Error generating order number:", error);
    // Fallback to client-side generation
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD${timestamp.toString().slice(-6)}${random}`;
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
