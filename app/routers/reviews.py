from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.marketing import Review
from app.models.catalog import Product
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewRead, ReviewReadWithUser

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/products/{product_id}", response_model=list[ReviewReadWithUser])
async def list_product_reviews(
    product_id: int,
    is_approved: bool | None = Query(default=True),
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0),
    session: AsyncSession = Depends(get_session),
) -> list[ReviewReadWithUser]:
    """Get all reviews for a product."""
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    query = select(Review, User.name.label("user_name")).join(User).where(Review.product_id == product_id)
    
    if is_approved is not None:
        query = query.where(Review.is_approved == is_approved)
    
    query = query.order_by(Review.created_at.desc()).offset(offset).limit(limit)
    result = await session.execute(query)
    
    reviews = []
    for review, user_name in result:
        review_dict = {
            "review_id": review.review_id,
            "user_id": review.user_id,
            "product_id": review.product_id,
            "rating": review.rating,
            "title": review.title,
            "comment": review.comment,
            "size_purchased": review.size_purchased,
            "images": review.images,
            "helpful_count": review.helpful_count,
            "created_at": review.created_at,
            "is_approved": review.is_approved,
            "user_name": user_name,
            "is_verified": True,  # All reviews require order_item, so they're verified
        }
        reviews.append(ReviewReadWithUser(**review_dict))
    
    return reviews


@router.get("/products/{product_id}/summary")
async def get_product_review_summary(
    product_id: int,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Get review summary (average rating, count) for a product."""
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    query = (
        select(
            func.count(Review.review_id).label("total_reviews"),
            func.avg(Review.rating).label("average_rating"),
        )
        .where(Review.product_id == product_id)
        .where(Review.is_approved == True)
    )
    result = await session.execute(query)
    row = result.one()
    
    # Get rating distribution
    dist_query = (
        select(Review.rating, func.count(Review.review_id))
        .where(Review.product_id == product_id)
        .where(Review.is_approved == True)
        .group_by(Review.rating)
    )
    dist_result = await session.execute(dist_query)
    distribution = {r: c for r, c in dist_result}
    
    return {
        "total_reviews": row.total_reviews or 0,
        "average_rating": float(row.average_rating) if row.average_rating else 0,
        "distribution": {
            5: distribution.get(5, 0),
            4: distribution.get(4, 0),
            3: distribution.get(3, 0),
            2: distribution.get(2, 0),
            1: distribution.get(1, 0),
        }
    }


@router.post("/{review_id}/helpful", response_model=ReviewRead)
async def mark_review_helpful(
    review_id: int,
    session: AsyncSession = Depends(get_session),
) -> ReviewRead:
    """Mark a review as helpful (increment helpful_count)."""
    review = await session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    review.helpful_count += 1
    await session.commit()
    await session.refresh(review)
    return review
