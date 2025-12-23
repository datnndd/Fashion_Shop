from fastapi import APIRouter, Depends, HTTPException, Query, status
import json
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_admin_user
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.schemas.product import ProductCreate, ProductCreateWithVariants, ProductRead, ProductReadWithDetails, ProductUpdate
from app.schemas.variant import ProductVariantCreate, ProductVariantRead

router = APIRouter(prefix="/catalog", tags=["catalog"])


# ==================== CATEGORIES ====================

@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate, 
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> CategoryRead:
    """
    Create a new category. Requires admin role.
    
    SQL: INSERT INTO categories (...) VALUES (...) RETURNING *
    """
    result = await session.execute(
        text("""
            INSERT INTO categories (name, slug, description, image, parent_id, is_active)
            VALUES (:name, :slug, :description, :image, :parent_id, :is_active)
            RETURNING *
        """),
        {
            "name": payload.name,
            "slug": payload.slug,
            "description": payload.description,
            "image": payload.image,
            "parent_id": payload.parent_id,
            "is_active": payload.is_active,
        }
    )
    category = result.mappings().one()
    await session.commit()
    return dict(category)


@router.get("/categories", response_model=list[CategoryRead])
async def list_categories(
    is_active: bool | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
) -> list[CategoryRead]:
    """
    List all categories with optional filter.
    
    SQL: SELECT * FROM categories [WHERE is_active = :is_active]
    """
    if is_active is not None:
        query = text("SELECT * FROM categories WHERE is_active = :is_active")
        params = {"is_active": is_active}
    else:
        query = text("SELECT * FROM categories")
        params = {}
    
    result = await session.execute(query, params)
    return [dict(c) for c in result.mappings().all()]


@router.get("/categories/{category_id}", response_model=CategoryRead)
async def get_category(
    category_id: int,
    session: AsyncSession = Depends(get_session),
) -> CategoryRead:
    """
    Get a single category by ID.
    
    SQL: SELECT * FROM categories WHERE category_id = :category_id
    """
    result = await session.execute(
        text("SELECT * FROM categories WHERE category_id = :category_id"),
        {"category_id": category_id}
    )
    category = result.mappings().one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return dict(category)


@router.put("/categories/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: int,
    payload: CategoryUpdate,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> CategoryRead:
    """
    Update a category. Requires admin role.
    
    SQL: UPDATE categories SET ... WHERE category_id = :category_id RETURNING *
    """
    # Check exists
    result = await session.execute(
        text("SELECT * FROM categories WHERE category_id = :category_id"),
        {"category_id": category_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    # Build dynamic update
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    
    set_clause = ", ".join(f"{key} = :{key}" for key in update_data.keys())
    update_data["category_id"] = category_id
    
    result = await session.execute(
        text(f"UPDATE categories SET {set_clause} WHERE category_id = :category_id RETURNING *"),
        update_data
    )
    category = result.mappings().one()
    await session.commit()
    return dict(category)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> None:
    """
    Delete a category. Requires admin role.
    
    SQL: DELETE FROM categories WHERE category_id = :category_id
    """
    # Check exists
    result = await session.execute(
        text("SELECT * FROM categories WHERE category_id = :category_id"),
        {"category_id": category_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    # Check if category has products
    count_result = await session.execute(
        text("SELECT COUNT(*) FROM products WHERE category_id = :category_id"),
        {"category_id": category_id}
    )
    product_count = count_result.scalar()
    if product_count and product_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Cannot delete category with {product_count} products. Remove products first."
        )
    
    await session.execute(
        text("DELETE FROM categories WHERE category_id = :category_id"),
        {"category_id": category_id}
    )
    await session.commit()


# ==================== PRODUCTS ====================

@router.post("/products", response_model=ProductReadWithDetails, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreateWithVariants,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> ProductReadWithDetails:
    """
    Create a new product with optional variants. Requires admin role.
    
    SQL: INSERT INTO products (...) VALUES (...) RETURNING *
         INSERT INTO product_variants (...) VALUES (...) for each variant
    """
    # Check category exists
    cat_result = await session.execute(
        text("SELECT * FROM categories WHERE category_id = :category_id"),
        {"category_id": payload.category_id}
    )
    if not cat_result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    # Insert product
    product_result = await session.execute(
        text("""
            INSERT INTO products (category_id, name, slug, description, base_price, thumbnail, 
                                  is_new, discount_percent, badge, images, is_published, created_at)
            VALUES (:category_id, :name, :slug, :description, :base_price, :thumbnail,
                    :is_new, :discount_percent, :badge, :images, :is_published, NOW())
            RETURNING *
        """),
        {
            "category_id": payload.category_id,
            "name": payload.name,
            "slug": payload.slug,
            "description": payload.description,
            "base_price": payload.base_price,
            "thumbnail": payload.thumbnail,
            "is_new": payload.is_new,
            "discount_percent": payload.discount_percent,
            "badge": payload.badge,
            "images": payload.images,
            "is_published": payload.is_published,
        }
    )
    product = dict(product_result.mappings().one())

    # Insert variants
    variants = []
    for variant_data in payload.variants:
        var_result = await session.execute(
            text("""
                INSERT INTO product_variants (product_id, sku, attributes, price, stock, images, is_active)
                VALUES (:product_id, :sku, :attributes, :price, :stock, :images, :is_active)
                RETURNING *
            """),
            {
                "product_id": product["product_id"],
                "sku": variant_data.sku,
                "attributes": variant_data.attributes,
                "price": variant_data.price,
                "stock": variant_data.stock,
                "images": variant_data.images,
                "is_active": variant_data.is_active,
            }
        )
        variants.append(dict(var_result.mappings().one()))

    await session.commit()
    
    product["variants"] = variants
    # Add computed properties
    product["is_sale"] = product["discount_percent"] > 0 if product["discount_percent"] else False
    product["sale_price"] = float(product["base_price"]) * (1 - product["discount_percent"] / 100) if product["discount_percent"] > 0 else None
    product["colors"] = _extract_colors(variants)
    
    return product


def _extract_colors(variants: list[dict]) -> list[str]:
    """Extract unique colors from variants."""
    colors = set()
    for v in variants:
        if v.get("attributes") and isinstance(v["attributes"], dict) and "color" in v["attributes"]:
            colors.add(v["attributes"]["color"])
    return list(colors)


@router.get("/products/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
) -> ProductRead:
    """
    Get a single product by ID with variants.
    
    SQL: SELECT * FROM products WHERE product_id = :product_id
         SELECT * FROM product_variants WHERE product_id = :product_id
    """
    # Get product
    result = await session.execute(
        text("SELECT * FROM products WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    product = result.mappings().one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    product = dict(product)
    
    # Sanitize images
    if isinstance(product.get("images"), dict):
        product["images"] = []
    
    # Get variants
    var_result = await session.execute(
        text("SELECT * FROM product_variants WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    variants = [dict(v) for v in var_result.mappings().all()]
    product["variants"] = variants
    
    # Add computed properties
    product["is_sale"] = product["discount_percent"] > 0 if product["discount_percent"] else False
    product["sale_price"] = float(product["base_price"]) * (1 - product["discount_percent"] / 100) if product["discount_percent"] > 0 else None
    product["colors"] = _extract_colors(variants)
    
    return product


@router.put("/products/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> ProductRead:
    """
    Update a product. Requires admin role.
    
    SQL: UPDATE products SET ... WHERE product_id = :product_id RETURNING *
    """
    # Check exists
    result = await session.execute(
        text("SELECT * FROM products WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Build dynamic update
    update_data = payload.model_dump(exclude_unset=True, exclude={"variants"})
    
    # Serialize JSON fields for asyncpg
    for k, v in update_data.items():
        if k in ["images", "attributes"] and isinstance(v, (list, dict)):
            update_data[k] = json.dumps(v)
    
    if update_data:
        update_data["updated_at"] = "NOW()"
        set_parts = []
        params = {"product_id": product_id}
        for key, value in update_data.items():
            if key == "updated_at":
                set_parts.append("updated_at = NOW()")
            else:
                set_parts.append(f"{key} = :{key}")
                params[key] = value
        
        await session.execute(
            text(f"UPDATE products SET {', '.join(set_parts)} WHERE product_id = :product_id"),
            params
        )

    # Handle variants update
    if payload.variants is not None:
        # Get existing variants
        var_result = await session.execute(
            text("SELECT variant_id, sku FROM product_variants WHERE product_id = :product_id"),
            {"product_id": product_id}
        )
        existing_ids = {row.variant_id for row in var_result}
        
        touched_ids = set()
        
        for v_data in payload.variants:
            v_dict = v_data.model_dump(exclude_unset=True)
            
            # Serialize JSON fields for asyncpg
            for k in ["images", "attributes"]:
                if k in v_dict and isinstance(v_dict[k], (list, dict)):
                    v_dict[k] = json.dumps(v_dict[k])
            
            v_id = v_dict.pop("variant_id", None)
            
            if v_id and v_id in existing_ids:
                # Update existing
                touched_ids.add(v_id)
                if v_dict:
                    set_clause = ", ".join(f"{k} = :{k}" for k in v_dict.keys())
                    v_dict["variant_id"] = v_id
                    await session.execute(
                        text(f"UPDATE product_variants SET {set_clause} WHERE variant_id = :variant_id"),
                        v_dict
                    )
            else:
                # Create new
                v_dict["product_id"] = product_id
                cols = list(v_dict.keys())
                vals = ", ".join(f":{k}" for k in cols)
                col_str = ", ".join(cols)
                
                try:
                    create_res = await session.execute(
                        text(f"INSERT INTO product_variants ({col_str}) VALUES ({vals}) RETURNING variant_id"),
                        v_dict
                    )
                    new_id = create_res.scalar()
                    touched_ids.add(new_id)
                except Exception as e:
                    # Likely missing fields for creation (e.g. price/sku)
                    print(f"Error creating variant: {e}")
                    raise HTTPException(status_code=400, detail=f"Error creating variant: {str(e)}")

        # Delete removed variants
        to_delete = existing_ids - touched_ids
        if to_delete:
            # Check for order dependencies if needed, or catch error
            try:
                await session.execute(
                    text("DELETE FROM product_variants WHERE variant_id = ANY(:ids)"),
                    {"ids": list(to_delete)}
                )
            except Exception as e:
                # Fallback to soft delete if hard delete fails (e.g. FK constraint)
                print(f"Could not hard delete variants {to_delete}, soft deleting instead. Error: {e}")
                await session.execute(
                    text("UPDATE product_variants SET is_active = FALSE WHERE variant_id = ANY(:ids)"),
                    {"ids": list(to_delete)}
                )

    await session.commit()
    
    # Return updated product
    result = await session.execute(
        text("SELECT * FROM products WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    product = dict(result.mappings().one())
    
    # Get variants
    var_result = await session.execute(
        text("SELECT * FROM product_variants WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    variants = [dict(v) for v in var_result.mappings().all()]
    product["variants"] = variants
    product["is_sale"] = product["discount_percent"] > 0 if product["discount_percent"] else False
    product["sale_price"] = float(product["base_price"]) * (1 - product["discount_percent"] / 100) if product["discount_percent"] > 0 else None
    product["colors"] = _extract_colors(variants)
    
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> None:
    """
    Delete a product. Requires admin role.
    
    SQL: DELETE FROM products WHERE product_id = :product_id
    """
    result = await session.execute(
        text("SELECT * FROM products WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    await session.execute(
        text("DELETE FROM products WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    await session.commit()


@router.get("/products", response_model=list[ProductRead])
async def list_products(
    q: str | None = Query(default=None, description="Search query"),
    min_price: float | None = Query(default=None),
    max_price: float | None = Query(default=None),
    category_id: int | None = Query(default=None),
    is_new: bool | None = Query(default=None),
    is_sale: bool | None = Query(default=None),
    is_published: str | None = Query(default="true", description="Filter by published status: 'true', 'false', or 'all'"),
    sort_by: str | None = Query(default=None, description="Sort field: 'price_asc', 'price_desc', 'newest', 'best_selling'"),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0),
    session: AsyncSession = Depends(get_session),
) -> list[ProductRead]:
    """
    List products with optional filters and sorting.
    
    SQL: SELECT * FROM products WHERE ... ORDER BY ... LIMIT ... OFFSET ...
    """
    # Build query dynamically
    conditions = []
    params = {"limit": limit, "offset": offset}

    if q:
        conditions.append("(name ILIKE :q OR description ILIKE :q)")
        params["q"] = f"%{q}%"
    if min_price is not None:
        conditions.append("base_price >= :min_price")
        params["min_price"] = min_price
    if max_price is not None:
        conditions.append("base_price <= :max_price")
        params["max_price"] = max_price
    if category_id is not None:
        # Get category and direct subcategories (2-level support)
        # Note: For deeper hierarchies, a recursive query (CTE) would be needed.
        cat_ids_result = await session.execute(
            text("SELECT category_id FROM categories WHERE category_id = :cid OR parent_id = :cid"),
            {"cid": category_id}
        )
        category_ids = [row.category_id for row in cat_ids_result]
        
        if category_ids:
            conditions.append("category_id = ANY(:category_ids)")
            params["category_ids"] = category_ids
        else:
            # If category doesn't exist, ensure no results
            conditions.append("1 = 0")
    if is_new is not None:
        conditions.append("is_new = :is_new")
        params["is_new"] = is_new
    if is_sale is not None:
        if is_sale:
            conditions.append("discount_percent > 0")
        else:
            conditions.append("discount_percent = 0")
    if is_published is not None and is_published.lower() != "all":
        # Parse boolean
        is_pub_bool = is_published.lower() == "true"
        conditions.append("is_published = :is_published")
        params["is_published"] = is_pub_bool
    
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    
    # Sorting
    if sort_by == "best_selling":
        # Join with order items to count sales
        query = text(f"""
            SELECT p.*, COALESCE(SUM(oi.quantity), 0) as total_sold
            FROM products p
            LEFT JOIN product_variants pv ON p.product_id = pv.product_id
            LEFT JOIN order_items oi ON pv.variant_id = oi.product_variant_id
            {where_clause}
            GROUP BY p.product_id
            ORDER BY total_sold DESC
            LIMIT :limit OFFSET :offset
        """)
    elif sort_by == "price_asc":
        order_clause = "ORDER BY base_price ASC"
        query = text(f"SELECT * FROM products{where_clause} {order_clause} LIMIT :limit OFFSET :offset")
    elif sort_by == "price_desc":
        order_clause = "ORDER BY base_price DESC"
        query = text(f"SELECT * FROM products{where_clause} {order_clause} LIMIT :limit OFFSET :offset")
    else:
        # Default newest
        order_clause = "ORDER BY created_at DESC"
        query = text(f"SELECT * FROM products{where_clause} {order_clause} LIMIT :limit OFFSET :offset")

    result = await session.execute(query, params)
    products = [dict(p) for p in result.mappings().all()]
    
    # Get variants for each product
    for product in products:
        # Sanitize images
        if isinstance(product.get("images"), dict):
            product["images"] = []
        var_result = await session.execute(
            text("SELECT * FROM product_variants WHERE product_id = :product_id"),
            {"product_id": product["product_id"]}
        )
        variants = [dict(v) for v in var_result.mappings().all()]
        product["variants"] = variants
        product["is_sale"] = product["discount_percent"] > 0 if product["discount_percent"] else False
        product["sale_price"] = float(product["base_price"]) * (1 - product["discount_percent"] / 100) if product["discount_percent"] > 0 else None
        product["colors"] = _extract_colors(variants)
    
    return products


# ==================== VARIANTS ====================

@router.post(
    "/products/{product_id}/variants",
    response_model=ProductVariantRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_variant(
    product_id: int,
    payload: ProductVariantCreate,
    session: AsyncSession = Depends(get_session),
) -> ProductVariantRead:
    """
    Create a new variant for a product.
    
    SQL: INSERT INTO product_variants (...) VALUES (...) RETURNING *
    """
    # Check product exists
    result = await session.execute(
        text("SELECT * FROM products WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    var_result = await session.execute(
        text("""
            INSERT INTO product_variants (product_id, sku, attributes, price, stock, images, is_active)
            VALUES (:product_id, :sku, :attributes, :price, :stock, :images, :is_active)
            RETURNING *
        """),
        {
            "product_id": product_id,
            "sku": payload.sku,
            "attributes": payload.attributes,
            "price": payload.price,
            "stock": payload.stock,
            "images": payload.images,
            "is_active": payload.is_active,
        }
    )
    variant = dict(var_result.mappings().one())
    await session.commit()
    return variant


@router.get("/products/{product_id}/variants", response_model=list[ProductVariantRead])
async def list_variants(
    product_id: int, 
    session: AsyncSession = Depends(get_session)
) -> list[ProductVariantRead]:
    """
    List all variants for a product.
    
    SQL: SELECT * FROM product_variants WHERE product_id = :product_id
    """
    # Check product exists
    result = await session.execute(
        text("SELECT * FROM products WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    var_result = await session.execute(
        text("SELECT * FROM product_variants WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    return [dict(v) for v in var_result.mappings().all()]
