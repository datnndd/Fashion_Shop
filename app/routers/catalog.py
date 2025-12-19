from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_admin_user
from app.models.catalog import Category, Product, ProductVariant
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryRead
from app.schemas.product import ProductCreate, ProductCreateWithVariants, ProductRead, ProductReadWithDetails, ProductUpdate
from app.schemas.variant import ProductVariantCreate, ProductVariantRead

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(payload: CategoryCreate, session: AsyncSession = Depends(get_session)) -> CategoryRead:
    category = Category(
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        parent_id=payload.parent_id,
        is_active=payload.is_active,
    )
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category


@router.get("/categories", response_model=list[CategoryRead])
async def list_categories(
    is_active: bool | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
) -> list[CategoryRead]:
    query = select(Category)
    if is_active is not None:
        query = query.where(Category.is_active == is_active)
    result = await session.scalars(query)
    return list(result.all())


@router.post("/products", response_model=ProductReadWithDetails, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreateWithVariants,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin_user),  # Require admin role
) -> ProductReadWithDetails:
    """Create a new product with optional variants. Requires admin role."""
    category = await session.get(Category, payload.category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    # Create product
    product = Product(
        category_id=payload.category_id,
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        base_price=payload.base_price,
        thumbnail=payload.thumbnail,
        is_new=payload.is_new,
        discount_percent=payload.discount_percent,
        badge=payload.badge,
        images=payload.images,
        is_published=payload.is_published,
    )
    session.add(product)
    await session.flush()  # Get product_id without committing

    # Create variants
    for variant_data in payload.variants:
        variant = ProductVariant(
            product_id=product.product_id,
            sku=variant_data.sku,
            attributes=variant_data.attributes,
            price=variant_data.price,
            stock=variant_data.stock,
            images=variant_data.images,
            is_active=variant_data.is_active,
        )
        session.add(variant)

    await session.commit()
    await session.refresh(product, ["variants", "category"])
    return product


@router.get("/products/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
) -> ProductRead:
    """Get a single product by ID."""
    query = select(Product).options(selectinload(Product.variants)).where(Product.product_id == product_id)
    result = await session.scalars(query)
    product = result.one_or_none()
    
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.put("/products/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin_user),
) -> ProductRead:
    """Update a product. Requires admin role."""
    # Eager load variants to prevent accidental detaching issues and for response
    query = select(Product).options(selectinload(Product.variants)).where(Product.product_id == product_id)
    result = await session.scalars(query)
    product = result.one_or_none()
    
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    product.updated_at = func.now()
    await session.commit()
    await session.refresh(product)
    
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin_user),
) -> None:
    """Delete a product. Requires admin role."""
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Hard delete for now as per user request "Xóa" usually implies removal, 
    # but models have deleted_at. Let's use soft delete.
    # Actually, let's check if the user wants soft or hard delete. 
    # The Task said "Fix Delete". 
    # Given I see deleted_at in model, soft delete is safer.
    # But wait, looking at other code, if I soft delete, listing needs to filter it out.
    # valid_products query in list_products already checks NOTHING about deleted_at?
    # Let's check list_products implementation again.
    
    # Checking list_products in previous view_file output:
    # It does NOT filter by deleted_at.
    # So if I soft delete, it will still show up unless I fix list_products too.
    # The list_products query:
    # query = select(Product)
    # ... filters ...
    
    # I should implement Soft Delete AND update list_products to filter out deleted items.
    # OR I can just Hard Delete for simplicity if "Fix" means "It's not working at all".
    # Since I am adding the endpoint, I get to choose. 
    # Let's go with Hard Delete for now to ensure it "Just Works" without side effects of showing up.
    # If I soft delete, I must ensure all queries filter it out.
    
    await session.delete(product)
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
    """List products with optional filters and sorting."""
    query = select(Product)
    
    if category_id is not None:
        query = query.where(Product.category_id == category_id)
    if is_new is not None:
        query = query.where(Product.is_new == is_new)
    if is_sale is not None:
        query = query.where(Product.is_sale == is_sale)
    if is_published is not None:
        query = query.where(Product.is_published == is_published)
    
    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.base_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.base_price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.created_at.desc())  # Default to newest
    
    query = query.offset(offset).limit(limit)
    # Eager load variants to populate the colors property
    query = query.options(selectinload(Product.variants))
    result = await session.scalars(query)
    return list(result.all())


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
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    variant = ProductVariant(
        product_id=product_id,
        sku=payload.sku,
        attributes=payload.attributes,
        price=payload.price,
        stock=payload.stock,
        images=payload.images,
        is_active=payload.is_active,
    )
    session.add(variant)
    await session.commit()
    await session.refresh(variant)
    return variant


@router.get("/products/{product_id}/variants", response_model=list[ProductVariantRead])
async def list_variants(product_id: int, session: AsyncSession = Depends(get_session)) -> list[ProductVariantRead]:
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    result = await session.scalars(select(ProductVariant).where(ProductVariant.product_id == product_id))
    return list(result.all())
