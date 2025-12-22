from fastapi import APIRouter, Depends, HTTPException, Query, status
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
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    
    update_data["updated_at"] = "NOW()"
    set_parts = []
    params = {"product_id": product_id}
    for key, value in update_data.items():
        if key == "updated_at":
            set_parts.append("updated_at = NOW()")
        else:
            set_parts.append(f"{key} = :{key}")
            params[key] = value
    
    result = await session.execute(
        text(f"UPDATE products SET {', '.join(set_parts)} WHERE product_id = :product_id RETURNING *"),
        params
    )
    product = dict(result.mappings().one())
    await session.commit()
    
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
    category_id: int | None = Query(default=None),
    is_new: bool | None = Query(default=None),
    is_sale: bool | None = Query(default=None),
    is_published: bool | None = Query(default=True),
    sort_by: str | None = Query(default=None, description="Sort field: 'price_asc', 'price_desc', 'newest'"),
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
    
    if category_id is not None:
        conditions.append("category_id = :category_id")
        params["category_id"] = category_id
    if is_new is not None:
        conditions.append("is_new = :is_new")
        params["is_new"] = is_new
    if is_sale is not None:
        if is_sale:
            conditions.append("discount_percent > 0")
        else:
            conditions.append("discount_percent = 0")
    if is_published is not None:
        conditions.append("is_published = :is_published")
        params["is_published"] = is_published
    
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    
    # Sorting
    if sort_by == "price_asc":
        order_clause = "ORDER BY base_price ASC"
    elif sort_by == "price_desc":
        order_clause = "ORDER BY base_price DESC"
    else:
        order_clause = "ORDER BY created_at DESC"
    
    query = text(f"SELECT * FROM products{where_clause} {order_clause} LIMIT :limit OFFSET :offset")
    result = await session.execute(query, params)
    products = [dict(p) for p in result.mappings().all()]
    
    # Get variants for each product
    for product in products:
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
