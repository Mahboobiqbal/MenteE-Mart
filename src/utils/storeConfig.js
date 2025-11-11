import supabase from "./supabase";

// Save store configuration to database
export const saveStoreConfiguration = async (storeData) => {
  try {
    const { data, error } = await supabase
      .from("store_configurations")
      .upsert([storeData])
      .select()
      .single();

    if (error) {
      console.error("Error saving store configuration:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in saveStoreConfiguration:", error);
    throw error;
  }
};

// Update store configuration
export const updateStoreConfiguration = async (storeId, updates) => {
  try {
    const { data, error } = await supabase
      .from("store_configurations")
      .update(updates)
      .eq("id", storeId)
      .select()
      .single();

    if (error) {
      console.error("Error updating store configuration:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateStoreConfiguration:", error);
    throw error;
  }
};

// Delete store configuration
export const deleteStoreConfiguration = async (storeId) => {
  try {
    const { error } = await supabase
      .from("store_configurations")
      .delete()
      .eq("id", storeId);

    if (error) {
      console.error("Error deleting store configuration:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteStoreConfiguration:", error);
    throw error;
  }
};

// Get store configuration from database
export const getStoreConfig = async (storeName) => {
  try {
    const { data, error } = await supabase
      .from("store_configurations")
      .select("*")
      .eq("store_name", storeName)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching store config:", error);
      // Return default config if no config found
      return {
        store_name: storeName,
        whatsapp_number: getDefaultWhatsAppNumber(storeName),
        commission_rate: 5.0,
        commission_type: "percentage",
        is_active: true,
      };
    }

    return data;
  } catch (error) {
    console.error("Error in getStoreConfig:", error);
    return {
      store_name: storeName,
      whatsapp_number: getDefaultWhatsAppNumber(storeName),
      commission_rate: 5.0,
      commission_type: "percentage",
      is_active: true,
    };
  }
};

// Get all active store configurations
export const getAllStoreConfigs = async () => {
  try {
    const { data, error } = await supabase
      .from("store_configurations")
      .select("*")
      .eq("is_active", true)
      .order("store_name");

    if (error) {
      console.error("Error fetching store configs:", error);
      return getDefaultStores();
    }

    if (!data || data.length === 0) {
      return getDefaultStores();
    }

    return data;
  } catch (error) {
    console.error("Error in getAllStoreConfigs:", error);
    return getDefaultStores();
  }
};

// Get default stores if database config doesn't exist
const getDefaultStores = () => {
  return [
    {
      store_name: "MenteE",
      whatsapp_number: "923001234567",
      commission_rate: 5.0,
      commission_type: "percentage",
      is_active: true,
      store_address: "Default MenteE Store Address",
      store_contact_email: "mentee@example.com",
    },
    {
      store_name: "Nainzaka",
      whatsapp_number: "923009876543",
      commission_rate: 5.0,
      commission_type: "percentage",
      is_active: true,
      store_address: "Default Nainzaka Store Address",
      store_contact_email: "nainzaka@example.com",
    },
  ];
};

// Get default WhatsApp numbers for stores
const getDefaultWhatsAppNumber = (storeName) => {
  const storeNumbers = {
    MenteE: "923001234567",
    Nainzaka: "923009876543",
  };
  return storeNumbers[storeName] || "923001234567";
};

// Get store WhatsApp URL for messaging
export const getStoreWhatsAppUrl = (storeName, order = null) => {
  const storeConfig = getDefaultStores().find(
    (store) => store.store_name === storeName
  );
  const whatsappNumber = storeConfig?.whatsapp_number || "923001234567";

  let message = "Hello! I have received a new order:\n\n";

  if (order) {
    message += `📦 Order: ${order.order_number}\n`;
    message += `💰 Total: ₨${Number(order.total_amount).toLocaleString()}\n`;
    message += `💳 Payment: ${order.payment_status || "pending"}\n`;
    message += `👤 Customer: ${order.customer_first_name} ${order.customer_last_name}\n`;
    message += `📞 Phone: ${order.customer_phone}\n`;
    message += `📧 Email: ${order.customer_email}\n`;
    message += `📍 Address: ${order.shipping_address}\n`;

    if (order.order_notes) {
      message += `📝 Notes: ${order.order_notes}\n`;
    }
  } else {
    message += "I need to discuss a new order.";
  }

  message += "\nPlease confirm receipt and processing time.\n\nThank you!";

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

// Calculate commission for an order
export const calculateCommission = async (order) => {
  try {
    // Get store configuration from database
    const storeConfig = await getStoreConfig(
      order.order_items?.[0]?.product_store || "MenteE"
    );
    const commissionRate = storeConfig.commission_rate || 5.0;

    const commissionAmount =
      Number(order.total_amount) * (commissionRate / 100);

    return {
      rate: commissionRate,
      amount: commissionAmount,
      storeConfig: storeConfig,
    };
  } catch (error) {
    console.error("Error calculating commission:", error);
    return {
      rate: 5.0,
      amount: Number(order.total_amount) * 0.05,
      storeConfig: { store_name: "MenteE", commission_rate: 5.0 },
    };
  }
};

// Generate commission report
export const generateCommissionReport = async (orders, stores) => {
  try {
    const report = {
      totalCommission: 0,
      storeReports: {},
    };

    for (const store of stores) {
      const storeOrders = orders.filter((order) => {
        const orderStore = order.order_items?.[0]?.product_store || "MenteE";
        return orderStore === store.store_name;
      });

      const storeSales = storeOrders.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      );
      const storeCommission = (storeSales * store.commission_rate) / 100;

      report.storeReports[store.store_name] = {
        store: store,
        sales: storeSales,
        commission: storeCommission,
        orders: storeOrders.length,
        averageOrderValue:
          storeOrders.length > 0 ? storeSales / storeOrders.length : 0,
      };

      report.totalCommission += storeCommission;
    }

    return report;
  } catch (error) {
    console.error("Error generating commission report:", error);
    return {
      totalCommission: 0,
      storeReports: {},
    };
  }
};

// Calculate store analytics
export const calculateStoreAnalytics = async (orders, stores) => {
  try {
    const analytics = {
      overall: {
        totalSales: 0,
        totalCommission: 0,
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        deliveredOrders: 0,
      },
      storeAnalytics: {},
    };

    for (const store of stores) {
      const storeOrders = orders.filter((order) => {
        const orderStore = order.order_items?.[0]?.product_store || "MenteE";
        return orderStore === store.store_name;
      });

      const storeSales = storeOrders.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      );
      const storeCommission = (storeSales * store.commission_rate) / 100;

      analytics.storeAnalytics[store.store_name] = {
        ...store,
        sales: storeSales,
        commission: storeCommission,
        orders: storeOrders.length,
        pendingOrders: storeOrders.filter((o) => o.status === "pending").length,
        confirmedOrders: storeOrders.filter((o) => o.status === "confirmed")
          .length,
        deliveredOrders: storeOrders.filter((o) => o.status === "delivered")
          .length,
        averageOrderValue:
          storeOrders.length > 0 ? storeSales / storeOrders.length : 0,
      };

      // Add to overall analytics
      analytics.overall.totalSales += storeSales;
      analytics.overall.totalCommission += storeCommission;
      analytics.overall.totalOrders += storeOrders.length;
      analytics.overall.pendingOrders += storeOrders.filter(
        (o) => o.status === "pending"
      ).length;
      analytics.overall.confirmedOrders += storeOrders.filter(
        (o) => o.status === "confirmed"
      ).length;
      analytics.overall.deliveredOrders += storeOrders.filter(
        (o) => o.status === "delivered"
      ).length;
    }

    return analytics;
  } catch (error) {
    console.error("Error calculating store analytics:", error);
    return {
      overall: {
        totalSales: 0,
        totalCommission: 0,
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        deliveredOrders: 0,
      },
      storeAnalytics: {},
    };
  }
};
