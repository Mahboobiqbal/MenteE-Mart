# Bulk Product Upload Script

A Node.js script to bulk upload products from a CSV file with automatic image uploads to Supabase.

## Features

✅ Read product data from CSV files  
✅ Automatically find and upload images from a folder  
✅ Bulk upload products to Supabase  
✅ Image validation and optimization  
✅ Detailed progress reporting  
✅ Error handling and retry logic  
✅ Support for 1-4 images per product

## Prerequisites

1. **Node.js** (v14 or higher)

   - Download from https://nodejs.org/

2. **Supabase Account** with:

   - Project URL and API keys
   - `products` table created
   - `product-images` storage bucket created

3. **Environment Variables**
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (recommended)

## Installation

1. **Install Dependencies**

```bash
cd Mena Bazar
npm install @supabase/supabase-js dotenv
```

2. **Setup Environment Variables**

Create or update `.env` file in project root:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key...
```

## Prepare Your Files

### 1. CSV File Format

Create a CSV file with product data. Example: `products.csv`

```csv
name,description,category,price,sale_price,sale_type,sale_start,sale_end,in_stock,featured,store,sku,color,size,material,tags
"Summer Dress","Beautiful summer dress","Women's Fashion",1500,1200,"summer_sale","2025-05-01","2025-05-31",true,true,"Nainzaka","SKU-001","Red, Blue, Green","S, M, L, XL","100% Cotton","summer, casual"
"Casual T-Shirt","Comfortable tshirt","Men's Fashion",500,400,"",,,true,false,"Nainzaka","SKU-002","Black, White","S, M, L, XL","95% Cotton, 5% Elastane","casual, basic"
```

**Required fields:**

- `name` - Product name
- `category` - Category name
- `price` - Regular price in PKR

**Optional fields:**

- `description`, `sale_price`, `sale_type`, `sale_start`, `sale_end`
- `in_stock`, `featured`, `store`, `sku`
- `color`, `size`, `material`, `tags`

See `PRODUCT_UPLOAD_TEMPLATE.csv` for complete template.

### 2. Images Folder Structure

Organize images in a folder with naming convention matching product names:

```
product-images/
├── summer-dress-1.jpg
├── summer-dress-2.jpg
├── summer-dress-3.jpg
├── casual-tshirt-1.jpg
├── casual-tshirt-2.jpg
└── ...
```

**Image naming rules:**

- First 5 characters of product slug must match image filename
- Supported formats: JPG, JPEG, PNG, WebP, GIF
- Max size: 5MB per image
- Max 4 images per product
- Images are sorted alphabetically and uploaded in order

## Usage

### Basic Usage

```bash
node scripts/bulk-upload-products.mjs --csv=./products.csv --images=./product-images
```

### With Custom Paths

```bash
node scripts/bulk-upload-products.mjs \
  --csv=/path/to/your/products.csv \
  --images=/path/to/your/images/folder
```

### CSV Only (No Images)

```bash
node scripts/bulk-upload-products.mjs --csv=./products.csv
```

## Examples

### Example 1: Upload Products with Images

```bash
# Create product images folder
mkdir product-images

# Add images to folder
# summer-dress-1.jpg, summer-dress-2.jpg, summer-dress-3.jpg
# casual-tshirt-1.jpg, casual-tshirt-2.jpg

# Run upload script
node scripts/bulk-upload-products.mjs \
  --csv=./PRODUCT_UPLOAD_TEMPLATE.csv \
  --images=./product-images
```

Output:

```
📋 Reading CSV file: ./PRODUCT_UPLOAD_TEMPLATE.csv
✓ Found 15 products to upload

[1/15] Processing: "Summer Dress"
  📸 Found 3 images
  ⬆️  Uploading: summer-dress-1.jpg
     ✓ Uploaded
  ⬆️  Uploading: summer-dress-2.jpg
     ✓ Uploaded
  ⬆️  Uploading: summer-dress-3.jpg
     ✓ Uploaded
  ✓ Product uploaded successfully

...

==================================================
📊 Upload Summary
==================================================
Total products: 15
Successful: 15
Failed: 0
Success rate: 100.0%
==================================================
```

### Example 2: CSV Only (No Images)

```bash
node scripts/bulk-upload-products.mjs --csv=./my-products.csv
```

Products will be created without images. You can add images manually later in the admin dashboard.

## Image Matching Algorithm

The script matches images to products using the following logic:

1. Slugify product name (e.g., "Summer Dress" → "summer-dress")
2. Slugify image filename (e.g., "summer-dress-1.jpg" → "summer-dress-1")
3. Compare first 5 characters
4. If match found, include image in product upload
5. Sort matches alphabetically
6. Upload maximum 4 images per product

### Example Matching:

| Product Name     | Image Files                                            | Matched Images |
| ---------------- | ------------------------------------------------------ | -------------- |
| "Summer Dress"   | summer-dress-1.jpg, summer-dress-2.jpg, summer-day.jpg | 2 matched      |
| "Casual T-Shirt" | casual-tshirt-1.jpg, casual-tshirt-2.jpg               | 2 matched      |
| "Premium Jeans"  | premium-jeans-1.jpg, jeans-blue.jpg                    | 1 matched      |

## Error Handling

The script handles various errors:

### Missing CSV File

```
Error: CSV file not found: ./products.csv
```

**Solution:** Check file path and ensure file exists

### Invalid CSV Format

```
Error: Failed to parse CSV: CSV file must contain at least header and one data row
```

**Solution:** Ensure CSV has header row and at least one data row

### Missing Required Fields

```
Error: Failed to upload product "Summer Dress": Missing required fields: name, category, price
```

**Solution:** Check CSV file for required fields

### Image Upload Failed

```
Error uploading image "summer-dress-1.jpg": File size exceeds 5MB limit
```

**Solution:** Compress images or use smaller files

### Supabase Connection Failed

```
Error: Failed to upload product: Failed to connect to Supabase
```

**Solution:** Check environment variables and internet connection

## Troubleshooting

### Issue: "Module not found: @supabase/supabase-js"

**Solution:**

```bash
npm install @supabase/supabase-js dotenv
```

### Issue: "VITE_SUPABASE_URL is not set"

**Solution:**

1. Check `.env` file exists in project root
2. Verify environment variables are set correctly
3. Run script from project root directory

### Issue: Images not uploading

**Solution:**

1. Check images folder path
2. Verify image filenames start with product slug
3. Ensure images are in supported format (JPG, PNG, WebP, GIF)
4. Check file size (max 5MB)

### Issue: Products uploaded but without images

**Solution:**

1. Images folder path is incorrect
2. Image filenames don't match product names
3. Check file permissions on images folder
4. Images may have uploaded successfully; check Supabase storage

## Database Schema

The script expects the `products` table to have these columns:

```sql
-- Required columns
id (UUID)
name (Text)
category (Text)
price (Numeric)

-- Optional columns
description (Text)
sale_price (Numeric)
sale_type (Text)
sale_start (Date)
sale_end (Date)
in_stock (Boolean)
featured (Boolean)
store (Text)
sku (Text)
color (Text)
size (Text)
material (Text)
tags (Text)
image_url (Text)
additional_images (Array)
slug (Text)
rating (Numeric)
reviews (Numeric)
review (Array)
views (Numeric)
clicks (Numeric)
whatsapp_clicks (Numeric)
views_by_date (JSON)
clicks_by_date (JSON)
created_at (Timestamp)
```

## Performance Tips

1. **Batch Processing:** Upload in batches of 50-100 products
2. **Image Optimization:** Compress images before uploading
   - Use tools like TinyPNG or ImageMagick
   - Aim for files < 500KB per image
3. **Network:** Run from a machine with good internet connection
4. **Timing:** Run during off-peak hours to avoid load

## Advanced Configuration

### Modify Script for Custom Logic

Edit `scripts/bulk-upload-products.mjs` to customize:

```javascript
// Change image matching logic
const findImages = (imagesFolder, productName) => {
  // Custom matching logic here
};

// Modify product data processing
const uploadProduct = async (product, imageUrls) => {
  // Custom data transformation here
};
```

## API Reference

### Functions

#### `parseCSV(csvPath)`

- **Description:** Parse CSV file and return array of products
- **Parameters:** `csvPath` (String) - Path to CSV file
- **Returns:** Array of product objects

#### `findImages(imagesFolder, productName)`

- **Description:** Find images matching product name
- **Parameters:**
  - `imagesFolder` (String) - Path to images folder
  - `productName` (String) - Product name
- **Returns:** Array of matching image filenames

#### `uploadImage(imagePath, fileName)`

- **Description:** Upload single image to Supabase
- **Parameters:**
  - `imagePath` (String) - Full path to image
  - `fileName` (String) - Display name
- **Returns:** Promise<String> - Public URL of uploaded image

#### `uploadProduct(product, imageUrls)`

- **Description:** Upload product to Supabase
- **Parameters:**
  - `product` (Object) - Product data
  - `imageUrls` (Array) - Array of image URLs
- **Returns:** Promise<Object> - Upload result

## Support & Debugging

### Enable Verbose Output

Modify the script to add console.log statements:

```javascript
// Add before uploadProduct call
console.log("Product data:", productData);
console.log("Image URLs:", imageUrls);
```

### Check Supabase Console

1. Go to Supabase dashboard
2. Navigate to Storage → product-images
3. Verify images are uploading
4. Check products table for uploaded records

### Common Questions

**Q: Can I update existing products?**  
A: Currently the script only inserts new products. Modify the `uploadProduct` function to use `upsert` for updates.

**Q: Can I upload from a database instead of CSV?**  
A: Yes, modify the `parseCSV` function to read from your database source.

**Q: Can I schedule this to run automatically?**  
A: Use cron jobs (Linux/Mac) or Task Scheduler (Windows) to run the script on a schedule.

## License

Same as Mena Bazar project

---

**Last Updated:** November 11, 2025  
**Version:** 1.0.0
