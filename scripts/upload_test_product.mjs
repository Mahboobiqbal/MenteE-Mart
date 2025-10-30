import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env from project root (defaults to process.cwd())
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Check .env"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  try {
    const bucket = "product-images";
    const basePath = `test-uploads`;
    const filename = `test-1x1-${Date.now()}.png`;
    const path = `${basePath}/${filename}`;

    // 1x1 transparent PNG (base64)
    const base64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
    const buffer = Buffer.from(base64, "base64");

    console.log("Uploading test image to bucket:", bucket, "at path:", path);

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: "image/png", upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError.message || uploadError);
      process.exit(1);
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    console.log("Upload succeeded. Public URL:", publicData.publicUrl);

    // Try to insert a minimal product row (optional)
    const product = {
      name: "Test Product (uploaded via script)",
      slug: `test-product-${Date.now()}`,
      description:
        "This is a test product inserted by scripts/upload_test_product.mjs",
      category: "Test",
      regular_price: 1.0,
      price: 1.0,
      in_stock: true,
      featured: false,
      image_url: publicData.publicUrl,
      additional_images: [],
      created_at: new Date().toISOString(),
    };

    console.log(
      "Attempting to insert a minimal product row into `products` table..."
    );
    const { error: insertError } = await supabase
      .from("products")
      .insert([product]);
    if (insertError) {
      console.error(
        "Insert error (table may not exist or permissions missing):",
        insertError.message || insertError
      );
    } else {
      console.log("Product inserted successfully.");
    }
  } catch (err) {
    console.error("Unexpected error:", err.message || err);
    process.exit(1);
  }
}

run();
