-- Create join table for product-category many-to-many
CREATE TABLE IF NOT EXISTS product_categories (
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_product_categories_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_categories_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Index to speed up lookups by category
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);

-- Backfill existing products using their current category_id
INSERT INTO product_categories (product_id, category_id)
SELECT p.product_id, p.category_id
FROM products p
WHERE p.category_id IS NOT NULL
ON CONFLICT DO NOTHING;
