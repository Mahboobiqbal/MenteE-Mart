import supabase from "./supabase";

// Add slug generation function
const generateStoreSlug = async (name, excludeStoreId = null) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let query = supabase.from("stores").select("id").eq("slug", slug);

    if (excludeStoreId) {
      query = query.neq("id", excludeStoreId);
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// ===== STORE MANAGEMENT =====

// Get all active stores
export const getAllStores = async () => {
  try {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
};

// Create new store
export const createStore = async (storeData) => {
  try {
    // First check if a store with this name already exists
    const { data: existingStore } = await supabase
      .from("stores")
      .select("id, name")
      .eq("name", storeData.name)
      .single();

    if (existingStore) {
      throw new Error(
        `A store with the name "${storeData.name}" already exists. Please choose a different name.`
      );
    }

    // Generate unique slug for the store
    const slug = await generateStoreSlug(storeData.name);

    const { data, error } = await supabase
      .from("stores")
      .insert([{ ...storeData, slug }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating store:", error);
    throw error;
  }
};

// Get single store by ID
export const getStoreById = async (storeId) => {
  try {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching store:", error);
    return null;
  }
};

// Update store
export const updateStore = async (storeId, updates) => {
  try {
    // If name is being updated, check for duplicates
    if (updates.name) {
      const { data: existingStore } = await supabase
        .from("stores")
        .select("id, name")
        .eq("name", updates.name)
        .neq("id", storeId)
        .single();

      if (existingStore) {
        throw new Error(
          `A store with the name "${updates.name}" already exists. Please choose a different name.`
        );
      }

      // Generate unique slug for the updated name
      const slug = await generateStoreSlug(updates.name, storeId);
      updates.slug = slug;
    }

    const { data, error } = await supabase
      .from("stores")
      .update(updates)
      .eq("id", storeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating store:", error);
    throw error;
  }
};

// Delete store (soft delete - set is_active to false)
export const deleteStore = async (storeId) => {
  try {
    const { data, error } = await supabase
      .from("stores")
      .update({ is_active: false })
      .eq("id", storeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error deleting store:", error);
    throw error;
  }
};

// ===== PRODUCT MANAGEMENT =====

// Get products for specific store
export const getProductsByStore = async (storeId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Get all products across all stores
export const getAllProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        stores!inner(
          id,
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
};

// Create product for specific store
export const createProduct = async (productData) => {
  try {
    // Generate unique slug within store
    const slug = await generateUniqueSlug(
      productData.store_id,
      productData.name
    );

    const { data, error } = await supabase
      .from("products")
      .insert([{ ...productData, slug }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update product
export const updateProduct = async (productId, updates) => {
  try {
    // If name is being updated, regenerate slug
    if (updates.name) {
      const { data: product } = await supabase
        .from("products")
        .select("store_id, name")
        .eq("id", productId)
        .single();

      if (product) {
        updates.slug = await generateUniqueSlug(
          product.store_id,
          updates.name,
          productId
        );
      }
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// ===== ORDER MANAGEMENT =====

// Get orders for specific store
export const getOrdersByStore = async (storeId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items(
          *,
          products(
            name,
            image_url
          )
        )
      `
      )
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// Get all orders across all stores
export const getAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        stores!inner(
          id,
          name,
          whatsapp_number
        ),
        order_items(
          *,
          products(
            name,
            image_url
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    const { data, error } = await supabase
      .from("orders")
      .insert([{ ...orderData, order_number: orderNumber }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, adminNotes = null) => {
  try {
    const updates = { status };
    if (adminNotes) {
      updates.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// ===== UTILITY FUNCTIONS =====

// Generate unique slug within store
const generateUniqueSlug = async (storeId, name, excludeProductId = null) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let query = supabase
      .from("products")
      .select("id")
      .eq("store_id", storeId)
      .eq("slug", slug);

    if (excludeProductId) {
      query = query.neq("id", excludeProductId);
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Generate unique order number
const generateOrderNumber = async () => {
  try {
    const { data, error } = await supabase.rpc("generate_order_number");

    if (error) throw error;
    return data;
  } catch (error) {
    // Fallback: generate order number locally
    const timestamp = Date.now().toString().slice(-6);
    return `ORD${timestamp.padStart(6, "0")}`;
  }
};

// ===== ANALYTICS & REPORTING =====

// Get store performance metrics
export const getStoreMetrics = async (storeId, dateRange = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    const { data, error } = await supabase
      .from("orders")
      .select("status, total_amount, commission_amount")
      .eq("store_id", storeId)
      .gte("created_at", startDate.toISOString());

    if (error) throw error;

    const metrics = {
      totalSales: 0,
      totalOrders: 0,
      totalCommission: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      deliveredOrders: 0,
    };

    data?.forEach((order) => {
      metrics.totalSales += Number(order.total_amount);
      metrics.totalOrders++;
      metrics.totalCommission += Number(order.commission_amount);

      switch (order.status) {
        case "pending":
          metrics.pendingOrders++;
          break;
        case "confirmed":
        case "processing":
          metrics.confirmedOrders++;
          break;
        case "delivered":
          metrics.deliveredOrders++;
          break;
      }
    });

    return metrics;
  } catch (error) {
    console.error("Error fetching store metrics:", error);
    return {
      totalSales: 0,
      totalOrders: 0,
      totalCommission: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      deliveredOrders: 0,
    };
  }
};

// Get overall business metrics
export const getBusinessMetrics = async (dateRange = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        status,
        total_amount,
        commission_amount,
        stores!inner(
          name,
          commission_rate
        )
      `
      )
      .gte("created_at", startDate.toISOString());

    if (error) throw error;

    const metrics = {
      totalSales: 0,
      totalOrders: 0,
      totalCommission: 0,
      storeMetrics: {},
    };

    data?.forEach((order) => {
      const storeName = order.stores.name;
      const amount = Number(order.total_amount);
      const commission = Number(order.commission_amount);

      metrics.totalSales += amount;
      metrics.totalOrders++;
      metrics.totalCommission += commission;

      if (!metrics.storeMetrics[storeName]) {
        metrics.storeMetrics[storeName] = {
          storeName,
          totalSales: 0,
          totalOrders: 0,
          totalCommission: 0,
        };
      }

      metrics.storeMetrics[storeName].totalSales += amount;
      metrics.storeMetrics[storeName].totalOrders++;
      metrics.storeMetrics[storeName].totalCommission += commission;
    });

    return metrics;
  } catch (error) {
    console.error("Error fetching business metrics:", error);
    return {
      totalSales: 0,
      totalOrders: 0,
      totalCommission: 0,
      storeMetrics: {},
    };
  }
};

// ===== WHATSAPP INTEGRATION =====

// Get store WhatsApp URL
export const getStoreWhatsAppUrl = (store, order = null) => {
  const whatsappNumber = store.whatsapp_number;
  let message = "Hello! You have a new order:\n\n";

  if (order) {
    message += `📦 Order: ${order.order_number}\n`;
    message += `💰 Total: ₨${Number(order.total_amount).toLocaleString()}\n`;
    message += `👤 Customer: ${order.customer_first_name} ${order.customer_last_name}\n`;
    message += `📞 Phone: ${order.customer_phone}\n`;
    message += `📍 Address: ${order.shipping_address}\n`;

    if (order.order_notes) {
      message += `📝 Notes: ${order.order_notes}\n`;
    }
  } else {
    message += "Please check your store dashboard for new orders.";
  }

  message += "\n\nThank you!";

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

// ===== CATEGORY MANAGEMENT =====

// Get all categories (defaults to active only unless includeInactive is true)
export const getAllCategories = async (includeInactive = false) => {
  try {
    let query = supabase.from("categories").select("*").order("sort_order");

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Get category by ID
export const getCategoryById = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
};

// Create new category
export const createCategory = async (categoryData) => {
  try {
    // Generate unique slug
    const slug = await generateCategorySlug(categoryData.name);

    const { data, error } = await supabase
      .from("categories")
      .insert([{ ...categoryData, slug }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Update category
export const updateCategory = async (categoryId, updates) => {
  try {
    // If name is being updated, regenerate slug
    if (updates.name) {
      updates.slug = await generateCategorySlug(updates.name, categoryId);
    }

    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Delete category (soft delete)
export const deleteCategory = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Generate unique category slug
const generateCategorySlug = async (name, excludeCategoryId = null) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let query = supabase.from("categories").select("id").eq("slug", slug);

    if (excludeCategoryId) {
      query = query.neq("id", excludeCategoryId);
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Generate commission report
export const generateCommissionReport = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        commission_amount,
        commission_rate,
        total_amount,
        stores!inner(
          name,
          whatsapp_number
        )
      `
      )
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (error) throw error;

    const report = {
      totalCommission: 0,
      storeReports: {},
    };

    data?.forEach((order) => {
      const storeName = order.stores.name;
      const commission = Number(order.commission_amount);

      if (!report.storeReports[storeName]) {
        report.storeReports[storeName] = {
          storeName,
          totalCommission: 0,
          orderCount: 0,
          whatsappNumber: order.stores.whatsapp_number,
        };
      }

      report.storeReports[storeName].totalCommission += commission;
      report.storeReports[storeName].orderCount++;
      report.totalCommission += commission;
    });

    return report;
  } catch (error) {
    console.error("Error generating commission report:", error);
    return { totalCommission: 0, storeReports: {} };
  }
};
