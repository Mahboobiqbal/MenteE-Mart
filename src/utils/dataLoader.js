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
  const data = await loadData("categories");
  const categories = data?.categories || [];

  let products = [];
  try {
    products = await getCachedData("products", loadProducts);
  } catch (error) {
    console.error("Error loading products for categories:", error);
  }

  const categoryCounts = new Map();
  products.forEach((product) => {
    const key = (product?.category || "").trim().toLowerCase();
    if (!key) return;
    categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
  });

  const totalProducts = products.length;

  return categories.map((category) => {
    const name = category.name || "";
    const key = name.trim().toLowerCase();
    const productCount =
      category.id === "all" ? totalProducts : categoryCounts.get(key) || 0;

    return {
      id: category.id || key || "uncategorized",
      name,
      emoji: category.emoji || category.icon || getEmojiForCategory(name),
      color: category.color || DEFAULT_CATEGORY_COLOR,
      description: category.description || "",
      productCount,
    };
  });
};

// Load stores enriched with product counts
export const loadStores = async () => {
  const data = await loadData("stores");
  const stores = data?.stores || [];

  let products = [];
  try {
    products = await getCachedData("products", loadProducts);
  } catch (error) {
    console.error("Error loading products for stores:", error);
  }

  const storeCounts = new Map();
  products.forEach((product) => {
    const key = (product?.store || "").trim().toLowerCase();
    if (!key) return;
    storeCounts.set(key, (storeCounts.get(key) || 0) + 1);
  });

  const totalProducts = products.length;

  return stores.map((store) => {
    const name = store.name || "";
    const key = name.trim().toLowerCase();
    const productCount =
      store.id === "all" ? totalProducts : storeCounts.get(key) || 0;

    return {
      ...store,
      productCount,
    };
  });
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
