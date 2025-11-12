#!/usr/bin/env node

/**
 * Bulk Product Upload Script
 * Reads product data from CSV file and uploads to Supabase with images
 *
 * Usage:
 * node bulk-upload-products.mjs --csv=path/to/products.csv --images=path/to/images/folder
 *
 * Example:
 * node bulk-upload-products.mjs --csv=./products.csv --images=./product-images
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per image

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_KEY);

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Utility functions
const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const slugify = (str = "") => {
  return str
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const parseCSV = (csvPath) => {
  try {
    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error("CSV file must contain at least header and one data row");
    }

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      // Simple CSV parsing (handles basic cases)
      const values = [];
      let current = "";
      let insideQuotes = false;

      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          values.push(current.trim().replace(/"/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/"/g, ""));

      if (values.length === headers.length) {
        const product = {};
        headers.forEach((header, idx) => {
          product[header] = values[idx] || "";
        });
        products.push(product);
      }
    }

    return products;
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
};

const findImages = (imagesFolder, productName) => {
  try {
    if (!fs.existsSync(imagesFolder)) {
      log(`Warning: Images folder not found: ${imagesFolder}`, "yellow");
      return [];
    }

    const slug = slugify(productName);
    const files = fs.readdirSync(imagesFolder);
    const imageFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        const fileSlug = slugify(path.basename(file, ext));
        return (
          [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) &&
          fileSlug.includes(slug.substring(0, 5))
        ); // Match first 5 chars of slug
      })
      .sort()
      .slice(0, 4); // Max 4 images

    return imageFiles;
  } catch (error) {
    log(
      `Error finding images for "${productName}": ${error.message}`,
      "yellow"
    );
    return [];
  }
};

const uploadImage = async (imagePath, fileName) => {
  try {
    const fileContent = fs.readFileSync(imagePath);

    if (fileContent.length > MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      );
    }

    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
    };

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const uniqueName = `${timestamp}-${randomStr}${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`products/${uniqueName}`, fileContent, {
        contentType: mimeTypes[ext] || "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`products/${uniqueName}`);

    return urlData.publicUrl;
  } catch (error) {
    log(`Error uploading image "${fileName}": ${error.message}`, "red");
    return null;
  }
};

const uploadProduct = async (product, imageUrls) => {
  try {
    // Validate required fields
    if (!product.name || !product.category || !product.price) {
      throw new Error("Missing required fields: name, category, price");
    }

    // Parse numeric values
    const price = parseFloat(product.price);
    const salePrice = product.sale_price
      ? parseFloat(product.sale_price)
      : null;

    if (isNaN(price)) {
      throw new Error("Invalid price value");
    }

    // Build product object
    const productData = {
      name: product.name.trim(),
      description: product.description ? product.description.trim() : null,
      category: product.category.trim(),
      price: price,
      regular_price: price,
      sale_price: salePrice,
      sale_type: product.sale_type || null,
      sale_start: product.sale_start || null,
      sale_end: product.sale_end || null,
      in_stock: product.in_stock?.toLowerCase() === "true",
      featured: product.featured?.toLowerCase() === "true",
      store: product.store ? product.store.trim() : null,
      sku: product.sku ? product.sku.trim() : `SKU-${Date.now()}`,
      color: product.color ? product.color.trim() : null,
      size: product.size ? product.size.trim() : null,
      material: product.material ? product.material.trim() : null,
      tags: product.tags ? product.tags.trim() : null,
      slug: slugify(product.name),
      image_url: imageUrls[0] || null,
      additional_images: imageUrls.slice(1) || [],
      rating: 0,
      reviews: 0,
      review: [],
      views: 0,
      clicks: 0,
      whatsapp_clicks: 0,
      views_by_date: {},
      clicks_by_date: {},
      created_at: new Date().toISOString(),
    };

    // Filter out null values
    Object.keys(productData).forEach((key) => {
      if (productData[key] === null) delete productData[key];
    });

    const { data, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    throw new Error(
      `Failed to upload product "${product.name}": ${error.message}`
    );
  }
};

const main = async () => {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    let csvPath = null;
    let imagesFolder = null;

    args.forEach((arg) => {
      if (arg.startsWith("--csv=")) {
        csvPath = arg.replace("--csv=", "");
      } else if (arg.startsWith("--images=")) {
        imagesFolder = arg.replace("--images=", "");
      }
    });

    if (!csvPath) {
      log("Error: --csv parameter is required", "red");
      log(
        "Usage: node bulk-upload-products.mjs --csv=path/to/products.csv --images=path/to/images",
        "yellow"
      );
      process.exit(1);
    }

    if (!fs.existsSync(csvPath)) {
      log(`Error: CSV file not found: ${csvPath}`, "red");
      process.exit(1);
    }

    // Read CSV file
    log(`\n📋 Reading CSV file: ${csvPath}`, "cyan");
    const products = parseCSV(csvPath);
    log(`✓ Found ${products.length} products to upload`, "green");

    // Process each product
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = `[${i + 1}/${products.length}]`;

      try {
        log(`\n${progress} Processing: "${product.name}"`, "blue");

        // Find and upload images
        let imageUrls = [];
        if (imagesFolder) {
          const imageFiles = findImages(imagesFolder, product.name);

          if (imageFiles.length === 0) {
            log(`  ⚠️  No images found for this product`, "yellow");
          } else {
            log(`  📸 Found ${imageFiles.length} images`, "cyan");

            for (const imageFile of imageFiles) {
              const imagePath = path.join(imagesFolder, imageFile);
              log(`  ⬆️  Uploading: ${imageFile}`, "cyan");
              const url = await uploadImage(imagePath, imageFile);
              if (url) {
                imageUrls.push(url);
                log(`     ✓ Uploaded`, "green");
              }
            }
          }
        }

        // Upload product
        if (imageUrls.length === 0 && imagesFolder) {
          log(`  ⚠️  Product will be created without images`, "yellow");
        }

        const result = await uploadProduct(product, imageUrls);
        log(`  ✓ Product uploaded successfully`, "green");
        successCount++;
      } catch (error) {
        log(`  ✗ Error: ${error.message}`, "red");
        errorCount++;
      }

      // Add small delay between uploads
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Summary
    log(`\n${"=".repeat(50)}`, "cyan");
    log(`📊 Upload Summary`, "cyan");
    log(`${"=".repeat(50)}`, "cyan");
    log(`Total products: ${products.length}`, "blue");
    log(`Successful: ${successCount}`, "green");
    log(`Failed: ${errorCount}`, errorCount > 0 ? "red" : "green");
    log(
      `Success rate: ${((successCount / products.length) * 100).toFixed(1)}%`,
      "blue"
    );
    log(`${"=".repeat(50)}\n`, "cyan");

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    log(`Fatal error: ${error.message}`, "red");
    process.exit(1);
  }
};

// Run the script
main();
