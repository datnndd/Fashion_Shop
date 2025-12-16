from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.collection import Collection, CollectionProduct
from app.models.catalog import Product
from app.schemas.collection import CollectionCreate, CollectionRead, CollectionReadWithProducts
from app.schemas.product import ProductRead

router = APIRouter(prefix="/collections", tags=["collections"])


@router.post("/", response_model=CollectionRead, status_code=status.HTTP_201_CREATED)
async def create_collection(
    payload: CollectionCreate,
    session: AsyncSession = Depends(get_session),
) -> CollectionRead:
    """Create a new collection."""
    collection = Collection(
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        accent_color=payload.accent_color,
        secondary_color=payload.secondary_color,
        border_color=payload.border_color,
        panel_bg_color=payload.panel_bg_color,
        gradient_overlay=payload.gradient_overlay,
        image_overlay=payload.image_overlay,
        is_active=payload.is_active,
    )
    session.add(collection)
    await session.commit()
    await session.refresh(collection)
    return collection


@router.get("/", response_model=list[CollectionRead])
async def list_collections(
    is_active: bool | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
) -> list[CollectionRead]:
    """List all collections."""
    query = select(Collection)
    if is_active is not None:
        query = query.where(Collection.is_active == is_active)
    result = await session.scalars(query)
    return list(result.all())


@router.get("/{collection_id}", response_model=CollectionRead)
async def get_collection(
    collection_id: int,
    session: AsyncSession = Depends(get_session),
) -> CollectionRead:
    """Get a single collection by ID."""
    collection = await session.get(Collection, collection_id)
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    return collection


@router.get("/{collection_id}/products", response_model=list[ProductRead])
async def get_collection_products(
    collection_id: int,
    session: AsyncSession = Depends(get_session),
) -> list[ProductRead]:
    """Get all products in a collection."""
    collection = await session.get(Collection, collection_id)
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    
    # Get product IDs from collection_products junction table
    query = (
        select(Product)
        .join(CollectionProduct, Product.product_id == CollectionProduct.product_id)
        .where(CollectionProduct.collection_id == collection_id)
        .where(Product.is_published == True)
    )
    result = await session.scalars(query)
    return list(result.all())


@router.post("/{collection_id}/products/{product_id}", status_code=status.HTTP_201_CREATED)
async def add_product_to_collection(
    collection_id: int,
    product_id: int,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Add a product to a collection."""
    collection = await session.get(Collection, collection_id)
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Check if already exists
    existing = await session.get(CollectionProduct, (collection_id, product_id))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product already in collection")
    
    collection_product = CollectionProduct(collection_id=collection_id, product_id=product_id)
    session.add(collection_product)
    await session.commit()
    return {"message": "Product added to collection"}


@router.delete("/{collection_id}/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_product_from_collection(
    collection_id: int,
    product_id: int,
    session: AsyncSession = Depends(get_session),
) -> None:
    """Remove a product from a collection."""
    collection_product = await session.get(CollectionProduct, (collection_id, product_id))
    if not collection_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not in collection")
    
    await session.delete(collection_product)
    await session.commit()
