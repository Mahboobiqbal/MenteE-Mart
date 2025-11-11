import supabase from "./supabase";

const DEFAULT_CATEGORY_COLOR = "#008060";

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const parseReviewList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Failed to parse product review column:", error);
      return [];
    }
  }
  return [];
};

// Data loading utilities for JSON files
export const loadData = async (fileName) => {
  try {
    const data = await import(`../data/catalog/${fileName}.json`);
    return data.default || data;
  } catch (error) {
    console.error(`Error loading ${fileName}:`, error);
    return null;
  }
};

// Cache for loaded data
const dataCache = new Map();

export async function getCachedData(key, loader) {
  if (dataCache.has(key)) {
    return dataCache.get(key);
  }

  const data = await loader();
  dataCache.set(key, data);
  return data;
}

// Clear cache when needed
export const clearDataCache = () => {
  dataCache.clear();
};

// Normalize product records fetched from Supabase
export const normalizeProductRecord = (product) => {
  if (!product) return null;

  const regularPrice =
    product.regular_price !== undefined
      ? toNumber(product.regular_price)
      : toNumber(product.price);
  const salePrice =
    product.sale_price !== undefined && product.sale_price !== null
      ? toNumber(product.sale_price)
      : null;
  const finalPrice = salePrice ?? toNumber(product.price ?? regularPrice);
  const imageUrl = product.image_url || product.image || null;
  const additionalImages = Array.isArray(product.additional_images)
    ? product.additional_images
    : Array.isArray(product.images)
    ? product.images
    : [];
  const reviewList = parseReviewList(product.review);
  const reviewCountRaw =
    product.reviews !== undefined ? Number(product.reviews) : null;
  const reviewCount = Number.isFinite(reviewCountRaw)
    ? reviewCountRaw
    : reviewList.length;

  return {
    ...product,
    price: finalPrice,
    regular_price: regularPrice,
    sale_price: salePrice,
    image_url: imageUrl,
    image: imageUrl,
    additional_images: additionalImages,
    view_count: toNumber(product.view_count ?? product.views),
    click_count: toNumber(product.click_count ?? product.clicks),
    whatsapp_clicks: toNumber(
      product.whatsapp_clicks ?? product.whatsappClicks
    ),
    rating: product.rating !== undefined ? Number(product.rating) : 0,
    reviews: reviewCount,
    review: reviewList,
  };
};

// Load product data directly from Supabase
export const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeProductRecord).filter(Boolean);
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
};

// Load categories with live product counts
export const loadCategories = async () => {
  try {
    const { data: categoriesData, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");

    if (error) throw error;

    let products = [];
    try {
      products = await getCachedData("products", loadProducts);
    } catch (productError) {
      console.error("Error loading products for categories:", productError);
    }

    const categoryCounts = new Map();
    products.forEach((product) => {
      const rawValue = (product?.category || "").trim().toLowerCase();
      if (!rawValue) return;
      categoryCounts.set(rawValue, (categoryCounts.get(rawValue) || 0) + 1);
    });

    const totalProducts = products.length;

    const categories = (categoriesData || []).map((category) => {
      const slugKey = (category?.slug || "").trim().toLowerCase();
      const nameKey = (category?.name || "").trim().toLowerCase();
      const productCount =
        categoryCounts.get(slugKey) ??
        categoryCounts.get(nameKey) ??
        categoryCounts.get(`${nameKey}-category`) ??
        0;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        emoji: category.icon || getEmojiForCategory(category.name),
        color: category.color || DEFAULT_CATEGORY_COLOR,
        description: category.description || "",
        image_url: category.image_url,
        parent_id: category.parent_id,
        sort_order: category.sort_order ?? 0,
        is_active: category.is_active ?? true,
        productCount,
      };
    });

    categories.sort((a, b) => a.sort_order - b.sort_order);

    return [
      {
        id: "all",
        name: "All Products",
        slug: "all",
        emoji: "🛍️",
        color: DEFAULT_CATEGORY_COLOR,
        description: "Browse the complete catalog",
        productCount: totalProducts,
        is_active: true,
        sort_order: -1,
      },
      ...categories,
    ];
  } catch (error) {
    console.error("Error loading categories from database:", error);
    return [];
  }
};

// Load stores enriched with product counts
export const loadStores = async () => {
  try {
    const { data: storesData, error } = await supabase
      .from("stores")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;

    let products = [];
    try {
      products = await getCachedData("products", loadProducts);
    } catch (productError) {
      console.error("Error loading products for stores:", productError);
    }

    const storeCountsById = new Map();
    const storeCountsByKey = new Map();

    products.forEach((product) => {
      const storeId = product?.store_id;
      if (storeId) {
        storeCountsById.set(storeId, (storeCountsById.get(storeId) || 0) + 1);
      }

      const storeNameValue = (product?.store || "").trim().toLowerCase();
      if (storeNameValue) {
        storeCountsByKey.set(
          storeNameValue,
          (storeCountsByKey.get(storeNameValue) || 0) + 1
        );
      }
    });

    const totalProducts = products.length;

    const formatPhone = (value) => {
      if (!value) return null;
      const cleaned = value.replace(/\s+/g, "");
      return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    };

    const stores = (storesData || []).map((store) => {
      const nameKey = (store?.name || "").trim().toLowerCase();
      const slugKey = (store?.slug || "").trim().toLowerCase();
      const productCount =
        storeCountsById.get(store.id) ??
        storeCountsByKey.get(slugKey) ??
        storeCountsByKey.get(nameKey) ??
        0;

      const phoneNumber =
        store.whatsapp_number || store.owner_phone || store.store_phone;

      return {
        ...store,
        productCount,
        contact: {
          phone: formatPhone(phoneNumber),
          email: store.owner_email || store.store_contact_email || null,
          whatsapp: formatPhone(store.whatsapp_number || phoneNumber),
        },
      };
    });

    return [
      {
        id: "all",
        name: "All Stores",
        productCount: totalProducts,
      },
      ...stores,
    ];
  } catch (error) {
    console.error("Error loading stores from database:", error);
    return [];
  }
};

// Load analytics data (fallback to JSON until analytics are driven by Supabase)
export const loadAnalytics = async () => {
  const data = await loadData("analytics");
  return data || {};
};

// Helper function to get emoji for category when none is provided
const getEmojiForCategory = (categoryName) => {
  const emojiMap = {
    "Shawals — Men's": "👕",
    "Shawals — Women's": "👗",
    "Citrale Caps": "🧢",
    "Peshawar Chappals": "👞",
    "All Products": "🛍️",
  };
  return emojiMap[categoryName] || "🛍️";
};
