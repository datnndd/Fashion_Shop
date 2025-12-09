from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.catalog import Category, Product, ProductVariant
from app.schemas.category import CategoryCreate, CategoryRead
from app.schemas.product import ProductCreate, ProductRead
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


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, session: AsyncSession = Depends(get_session)) -> ProductRead:
    category = await session.get(Category, payload.category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    product = Product(
        category_id=payload.category_id,
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        base_price=payload.base_price,
        thumbnail=payload.thumbnail,
        is_published=payload.is_published,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


@router.get("/products", response_model=list[ProductRead])
async def list_products(
    category_id: int | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
) -> list[ProductRead]:
    query = select(Product)
    if category_id is not None:
        query = query.where(Product.category_id == category_id)
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
        image_url=payload.image_url,
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
