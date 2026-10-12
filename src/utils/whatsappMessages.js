// WhatsApp message templates for different order statuses
export const getWhatsAppMessage = (order, orderStatus) => {
  const {
    order_number,
    customer_first_name,
    customer_last_name,
    total_amount,
    order_items,
  } = order;
  const customerName = `${customer_first_name} ${customer_last_name}`;

  switch (orderStatus) {
    case "confirmed":
      return `🎉 *Order Confirmed!*

Hi ${customerName}!

Your order *#${order_number}* has been confirmed and is being prepared for shipping.

📦 *Order Details:*
${order_items
  .map(
    (item) =>
      `• ${item.product_name} (Qty: ${
        item.quantity
      }) - ₨${item.unit_price.toLocaleString()}`
  )
  .join("\n")}

💰 *Total: ₨${Number(total_amount).toLocaleString()}*

📍 We're now processing your order and will ship it soon!

Thank you for shopping with us! 🛍️`;

    case "processing":
      return `⚙️ *Order Processing*

Hello ${customerName}!

Your order *#${order_number}* is currently being processed.

📦 Your items are being prepared for shipment
🚚 Expected shipping: 1-2 business days

We'll notify you once your order is shipped!

Best regards,
Your Store Team`;

    case "shipped":
      return `📦 *Order Shipped!*

Great news ${customerName}!

Your order *#${order_number}* has been shipped! 🚚

📦 *Tracking Information:*
• Order Number: #${order_number}
• Status: In Transit
• Expected Delivery: 2-3 business days

📱 Track your order: [Your tracking link here]

Thank you for your patience! 🎁`;

    case "delivered":
      return `✅ *Order Delivered!*

Delivered successfully! 🎉

Hi ${customerName},

Your order *#${order_number}* has been delivered to your address.

📦 Please confirm that you received all items in good condition.

⭐ If you're satisfied with your purchase, we'd love to hear your feedback!

Thank you for choosing us! 💚

*We appreciate your business!*`;

    case "payment_confirmed":
      return `💳 *Payment Confirmed!*

Payment received! Thank you ${customerName}!

📋 *Payment Details:*
• Order: #${order_number}
• Amount: ₨${Number(total_amount).toLocaleString()}
• Status: ✅ Paid

🎯 Your order is now confirmed and will be processed shortly.

We're preparing your items for shipment!

Best regards,
Your Store Team`;

    default:
      return `📋 *Order Update*

Hi ${customerName}!

Here's an update on your order *#${order_number}*:

Status: ${orderStatus}

Total: ₨${Number(total_amount).toLocaleString()}

We'll keep you updated on your order progress!

Thank you!`;
  }
};

// WhatsApp contact information for different stores
export const getStoreWhatsAppInfo = (storeName) => {
  const storeContacts = {
    "Mena Bazar": {
      phoneNumber: "923472886228", // Replace with actual Mena Bazar WhatsApp
      displayName: "Mena Bazar Store",
      message: "Hello! I have a question about my Mena Bazar order.",
    },
    Default: {
      phoneNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "923472886228",
      displayName: "Customer Support",
      message: "Hello! I have a question about my order.",
    },
  };

  return storeContacts[storeName] || storeContacts["Default"];
};

// Generate WhatsApp URL for a specific order and message
export const generateWhatsAppUrl = (order, messageType = "default") => {
  const message = getWhatsAppMessage(order, messageType);
  const storeInfo = getStoreWhatsAppInfo(
    order.order_items?.[0]?.product_store || "Default"
  );

  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = storeInfo.phoneNumber.replace(/\D/g, ""); // Remove non-digits

  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

// Quick WhatsApp contact for general inquiries
export const getStoreContactUrl = (storeName = "Default") => {
  const storeInfo = getStoreWhatsAppInfo(storeName);
  const encodedMessage = encodeURIComponent(storeInfo.message);
  const phoneNumber = storeInfo.phoneNumber.replace(/\D/g, "");

  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

// Resolve a store's WhatsApp number from a normalized product record
export const resolveStoreWhatsAppNumber = (product) => {
  const raw =
    product?.store_whatsapp ||
    product?.whatsapp_number ||
    product?.stores?.whatsapp_number ||
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    "";
  return String(raw).replace(/\D/g, "");
};

// Build the order message a customer sends to the store
export const buildProductOrderMessage = (product, quantity = 1) => {
  const unitPrice = Number(product?.sale_price ?? product?.price ?? 0);
  const qty = Math.max(1, Number(quantity) || 1);
  const storeName = product?.store || product?.stores?.name || "Mena Bazar";

  return [
    "*NEW ORDER REQUEST*",
    "",
    `*Product:* ${product?.name || ""}`,
    `*Store:* ${storeName}`,
    `*Unit Price:* Rs ${unitPrice.toLocaleString()}`,
    `*Quantity:* ${qty}`,
    `*Total:* Rs ${(unitPrice * qty).toLocaleString()}`,
    "",
    "Please confirm availability and delivery details.",
  ].join("\n");
};

// Generate a WhatsApp order URL for a customer to contact the product's store
export const getProductOrderWhatsAppUrl = (product, quantity = 1) => {
  const number = resolveStoreWhatsAppNumber(product);
  const message = buildProductOrderMessage(product, quantity);
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
};
