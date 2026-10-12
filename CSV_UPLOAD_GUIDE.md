# Product CSV Upload Template Guide

## Overview

This CSV template is designed for bulk uploading products to the Mena Bazar platform. It includes all essential and optional product fields.

## CSV File Format

- **Encoding**: UTF-8
- **Delimiter**: Comma (,)
- **Header Row**: Required (first row with column names)
- **File Extension**: .csv

## Column Definitions

### Required Fields

| Column     | Description               | Format                       | Example           |
| ---------- | ------------------------- | ---------------------------- | ----------------- |
| `name`     | Product name/title        | Text (max 255 chars)         | "Summer Dress"    |
| `category` | Product category          | Must match existing category | "Women's Fashion" |
| `price`    | Regular/base price in PKR | Numeric (no currency symbol) | 1500              |
| `in_stock` | Stock availability        | true or false                | true              |

### Optional but Recommended Fields

| Column        | Description                   | Format                            | Example                     |
| ------------- | ----------------------------- | --------------------------------- | --------------------------- |
| `description` | Detailed product description  | Text (detailed information)       | "Beautiful summer dress..." |
| `sale_price`  | Discounted price in PKR       | Numeric (leave empty if no sale)  | 1200                        |
| `category`    | Product category              | Text matching existing categories | "Women's Fashion"           |
| `store`       | Store/shop name               | Text (must match existing store)  | "Nainzaka"                  |
| `sku`         | Stock Keeping Unit/Product ID | Alphanumeric, must be unique      | "SKU-001"                   |
| `color`       | Available colors              | Comma-separated list              | "Red, Blue, Green"          |
| `size`        | Available sizes               | Comma-separated list              | "S, M, L, XL"               |
| `material`    | Material composition          | Text                              | "100% Cotton"               |
| `tags`        | Search tags/keywords          | Comma-separated                   | "summer, dress, casual"     |

### Sale/Promotion Fields

| Column       | Description            | Format               | Example       |
| ------------ | ---------------------- | -------------------- | ------------- |
| `sale_type`  | Type of sale/promotion | See Sale Types below | "summer_sale" |
| `sale_start` | Sale start date        | YYYY-MM-DD           | "2025-05-01"  |
| `sale_end`   | Sale end date          | YYYY-MM-DD           | "2025-05-31"  |
| `featured`   | Featured product       | true or false        | true          |

### Available Sale Types

```
- summer_sale
- winter_special
- sale_10 (10% off)
- sale_15 (15% off)
- sale_20 (20% off)
- sale_25 (25% off)
- discount_10
- discount_15
- discount_20
- bulk_discount
- tech_sale
- sale_black_friday
```

## Data Entry Guidelines

### 1. Product Name

- Keep concise but descriptive
- Max 255 characters
- Use proper capitalization
- Example: "Premium Cotton T-Shirt" ✅ vs "tshirt" ❌

### 2. Description

- Provide detailed information
- Include key features and benefits
- Use 50-200 words
- Separate sentences with periods
- Example: "Beautiful summer dress with floral print, perfect for casual occasions. Made from breathable cotton fabric."

### 3. Categories

Must match exactly with existing categories. Common categories:

- Women's Fashion
- Men's Fashion
- Accessories
- Footwear
- Home & Living
- Electronics
- Beauty & Personal Care

### 4. Price Fields

- Use numeric values only (no ₨ symbol)
- Do not use commas (1500 not 1,500)
- Use decimals for cents if needed (1500.50)
- sale_price should be lower than price
- Leave sale_price empty if no sale

### 5. Store Field

Must match exact store name:

- "Nainzaka"
- "Fashion Hub"
- "Sports Store"
- "Style Station"
- "Home Essentials"
- "Tech Store"

### 6. Colors and Sizes

- List multiple options separated by commas
- Include space after comma: "Red, Blue, Green" ✅
- Not "Red,Blue,Green" ✌️
- Examples:
  - Colors: "Black, White, Navy, Gray"
  - Sizes: "S, M, L, XL, XXL"

### 7. Material

- Indicate composition percentage if known
- Examples:
  - "100% Cotton"
  - "95% Cotton, 5% Elastane"
  - "Stainless Steel, Leather"
  - "Plastic, Lithium"

### 8. Tags

- Comma-separated keywords for search
- Use lowercase
- Include product type, style, occasion
- Example: "summer, dress, casual, floral"

### 9. Stock Status (in_stock)

- Use: true or false (lowercase)
- Do not use: True, FALSE, yes, 1, 0

### 10. Featured

- Use: true or false (lowercase)
- Set to true for promotional/bestseller products
- Recommended: 20-30% of products

### 11. Sale Dates

- Format: YYYY-MM-DD
- Examples:
  - "2025-05-01" ✅
  - "05/01/2025" ❌
  - "May 1, 2025" ❌
- Leave empty if no sale
- sale_end should be after sale_start

## Examples

### Example 1: Simple Product (No Sale)

```csv
name,description,category,price,in_stock,store,sku,color,size,material,tags
"Cotton Bedsheet Set","Comfortable 3-piece cotton bedsheet set. Easy care and maintenance.","Home & Living",1200,,true,"Home Essentials","SKU-011","White, Blue, Gray","Single, Double, Queen","100% Cotton","bedsheet, cotton, home"
```

### Example 2: Product with Active Sale

```csv
name,description,category,price,sale_price,sale_type,sale_start,sale_end,in_stock,featured,store,sku,color
"Summer Dress","Beautiful summer dress with floral print.","Women's Fashion",1500,1200,"summer_sale","2025-05-01","2025-05-31",true,true,"Nainzaka","SKU-001","Red, Blue, Green"
```

### Example 3: Electronics Product

```csv
name,description,category,price,sale_price,sale_type,sale_start,sale_end,in_stock,featured,store,sku,material,tags
"Fitness Band","Smart fitness tracker with heart rate monitor. Water resistant.","Electronics",2500,2000,"tech_sale","2025-11-01","2025-12-31",true,true,"Tech Store","SKU-015","Silicone, Plastic","fitness, tracker, smart, health"
```

## Common Issues & Solutions

### Issue: "Name cannot be empty"

**Solution**: Ensure product name field has a value and is not left blank

### Issue: "Category not found"

**Solution**: Check category spelling and match exactly with existing categories in system

### Issue: "Store not found"

**Solution**: Verify store name matches exactly; check for typos or extra spaces

### Issue: "Invalid price format"

**Solution**: Use numbers only, no currency symbols or commas (e.g., 1500 not 1,500 or ₨1,500)

### Issue: "Date format invalid"

**Solution**: Use YYYY-MM-DD format (e.g., 2025-05-01 not 05/01/2025)

### Issue: "Sale price should be less than regular price"

**Solution**: Ensure sale_price < price

## Best Practices

1. **Spelling & Grammar**: Proofread descriptions for typos
2. **Consistent Formatting**: Use same naming conventions for colors, sizes
3. **Complete Data**: Fill in as many fields as possible for better search results
4. **Unique SKU**: Each product should have a unique SKU/product ID
5. **Image Uploads**: Images must be uploaded separately (not in CSV)
6. **Testing**: Upload a small batch first to verify format
7. **Backups**: Keep a backup of your CSV before uploading

## Upload Instructions

1. **Prepare CSV File**

   - Open PRODUCT_UPLOAD_TEMPLATE.csv in Excel, Google Sheets, or text editor
   - Enter your product data
   - Save as CSV format

2. **Verify Data**

   - Check for empty required fields
   - Validate prices are numeric
   - Ensure categories exist in system
   - Verify dates are in correct format

3. **Upload to System**

   - Go to Admin Dashboard → Bulk Upload
   - Select your CSV file
   - Preview data before confirming
   - Click Upload

4. **Add Images**
   - After upload completes, add product images
   - Each product should have at least 1 image
   - Upload up to 5 images per product

## Support

For issues or questions:

- Contact admin support
- Email: admin@menabazar.com
- Include your CSV file and error message

---

**Last Updated**: November 11, 2025
**Template Version**: 1.0
