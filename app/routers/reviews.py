from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_admin_user, get_current_user
from app.schemas.review import ReviewCreate, ReviewRead, ReviewReadWithUser, ReviewReadAdmin

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> ReviewRead:
    """
    Create a review for an order item once it has been delivered.
    """
    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rating must be between 1 and 5")

    # Ensure product exists
    product_result = await session.execute(
        text("SELECT product_id FROM products WHERE product_id = :product_id"),
        {"product_id": payload.product_id}
    )
    if not product_result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Verify order item belongs to the user and order is delivered
    order_item_result = await session.execute(
        text(
            """
            SELECT oi.order_item_id, oi.product_variant_id, oi.variant_attributes_snapshot,
                   o.user_id, o.status, pv.product_id
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            LEFT JOIN product_variants pv ON oi.product_variant_id = pv.variant_id
            WHERE oi.order_item_id = :order_item_id
            """
        ),
        {"order_item_id": payload.order_item_id}
    )
    order_item = order_item_result.mappings().one_or_none()
    if not order_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order item not found")
    if order_item["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only review your own orders")
    if order_item["status"] != "delivered":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only delivered orders can be reviewed")
    if order_item["product_id"] and order_item["product_id"] != payload.product_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product does not match order item")

    # One review per order item
    existing_result = await session.execute(
        text("SELECT review_id FROM reviews WHERE order_item_id = :order_item_id"),
        {"order_item_id": payload.order_item_id}
    )
    if existing_result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already reviewed this item")

    size_purchased = payload.size_purchased
    if size_purchased is None and isinstance(order_item.get("variant_attributes_snapshot"), dict):
        for key in ("size", "size_name"):
            value = order_item["variant_attributes_snapshot"].get(key)
            if value:
                size_purchased = str(value)
                break

    result = await session.execute(
        text(
            """
            INSERT INTO reviews (
                user_id, product_id, order_item_id, rating, title, comment, images, size_purchased, helpful_count, is_approved
            ) VALUES (
                :user_id, :product_id, :order_item_id, :rating, :title, :comment, :images, :size_purchased, 0, true
            )
            RETURNING *
            """
        ),
        {
            "user_id": current_user["user_id"],
            "product_id": payload.product_id,
            "order_item_id": payload.order_item_id,
            "rating": payload.rating,
            "title": payload.title,
            "comment": payload.comment,
            "images": payload.images,
            "size_purchased": size_purchased,
        }
    )
    review = result.mappings().one()
    await session.commit()
    return dict(review)


@router.get("/products/{product_id}", response_model=list[ReviewReadWithUser])
async def list_product_reviews(
    product_id: int,
    is_approved: bool | None = Query(default=True),
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0),
    session: AsyncSession = Depends(get_session),
) -> list[ReviewReadWithUser]:
    """
    Get all reviews for a product.
    
    SQL: SELECT r.*, u.name as user_name 
         FROM reviews r 
         JOIN users u ON r.user_id = u.user_id 
         WHERE r.product_id = :product_id [AND r.is_approved = :is_approved]
         ORDER BY r.created_at DESC LIMIT ... OFFSET ...
    """
    # Check product exists
    result = await session.execute(
        text("SELECT * FROM products WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Build query with optional is_approved filter
    if is_approved is not None:
        query = text("""
            SELECT r.*, u.name as user_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.user_id 
            WHERE r.product_id = :product_id AND r.is_approved = :is_approved
            ORDER BY r.created_at DESC 
            LIMIT :limit OFFSET :offset
        """)
        params = {"product_id": product_id, "is_approved": is_approved, "limit": limit, "offset": offset}
    else:
        query = text("""
            SELECT r.*, u.name as user_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.user_id 
            WHERE r.product_id = :product_id
            ORDER BY r.created_at DESC 
            LIMIT :limit OFFSET :offset
        """)
        params = {"product_id": product_id, "limit": limit, "offset": offset}
    
    result = await session.execute(query, params)
    reviews = []
    for row in result.mappings().all():
        review_dict = dict(row)
        review_dict["is_verified"] = True  # All reviews require order_item, so they're verified
        reviews.append(review_dict)
    
    return reviews


@router.get("/products/{product_id}/summary")
async def get_product_review_summary(
    product_id: int,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Get review summary (average rating, count) for a product.
    
    SQL: SELECT COUNT(*) as total_reviews, AVG(rating) as average_rating 
         FROM reviews WHERE product_id = :product_id AND is_approved = true
         
         SELECT rating, COUNT(*) as count 
         FROM reviews WHERE product_id = :product_id AND is_approved = true
         GROUP BY rating
    """
    # Check product exists
    result = await session.execute(
        text("SELECT * FROM products WHERE product_id = :product_id"),
        {"product_id": product_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Get summary
    summary_result = await session.execute(
        text("""
            SELECT COUNT(*) as total_reviews, AVG(rating) as average_rating 
            FROM reviews 
            WHERE product_id = :product_id AND is_approved = true
        """),
        {"product_id": product_id}
    )
    summary = summary_result.mappings().one()
    
    # Get distribution
    dist_result = await session.execute(
        text("""
            SELECT rating, COUNT(*) as count 
            FROM reviews 
            WHERE product_id = :product_id AND is_approved = true
            GROUP BY rating
        """),
        {"product_id": product_id}
    )
    distribution = {r["rating"]: r["count"] for r in dist_result.mappings().all()}
    
    return {
        "total_reviews": summary["total_reviews"] or 0,
        "average_rating": float(summary["average_rating"]) if summary["average_rating"] else 0,
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
    """
    Mark a review as helpful (increment helpful_count).
    
    SQL: UPDATE reviews SET helpful_count = helpful_count + 1 WHERE review_id = :review_id RETURNING *
    """
    result = await session.execute(
        text("SELECT * FROM reviews WHERE review_id = :review_id"),
        {"review_id": review_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    result = await session.execute(
        text("UPDATE reviews SET helpful_count = helpful_count + 1 WHERE review_id = :review_id RETURNING *"),
        {"review_id": review_id}
    )
    review = result.mappings().one()
    await session.commit()
    return dict(review)


@router.get("", response_model=list[ReviewReadAdmin])
async def list_all_reviews(
    is_approved: bool | None = Query(default=None),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0),
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> list[ReviewReadAdmin]:
    """
    Get all reviews (for admin dashboard).
    
    SQL: SELECT r.*, u.name as user_name, p.name as product_name, p.slug as product_slug
         FROM reviews r
         JOIN users u ON r.user_id = u.user_id
         JOIN products p ON r.product_id = p.product_id
         [WHERE r.is_approved = :is_approved]
         ORDER BY r.created_at DESC LIMIT ... OFFSET ...
    """
    if is_approved is not None:
        query = text("""
            SELECT r.*, u.name as user_name, p.name as product_name, p.slug as product_slug
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            JOIN products p ON r.product_id = p.product_id
            WHERE r.is_approved = :is_approved
            ORDER BY r.created_at DESC 
            LIMIT :limit OFFSET :offset
        """)
        params = {"is_approved": is_approved, "limit": limit, "offset": offset}
    else:
        query = text("""
            SELECT r.*, u.name as user_name, p.name as product_name, p.slug as product_slug
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            JOIN products p ON r.product_id = p.product_id
            ORDER BY r.created_at DESC 
            LIMIT :limit OFFSET :offset
        """)
        params = {"limit": limit, "offset": offset}
    
    result = await session.execute(query, params)
    reviews = []
    for row in result.mappings().all():
        review_dict = dict(row)
        review_dict["is_verified"] = True
        reviews.append(review_dict)
    
    return reviews


@router.patch("/{review_id}/approve", response_model=ReviewRead)
async def approve_review(
    review_id: int,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> ReviewRead:
    """
    Approve a review.
    
    SQL: UPDATE reviews SET is_approved = true WHERE review_id = :review_id RETURNING *
    """
    result = await session.execute(
        text("SELECT * FROM reviews WHERE review_id = :review_id"),
        {"review_id": review_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    result = await session.execute(
        text("UPDATE reviews SET is_approved = true WHERE review_id = :review_id RETURNING *"),
        {"review_id": review_id}
    )
    review = result.mappings().one()
    await session.commit()
    return dict(review)


@router.patch("/{review_id}/reject", response_model=ReviewRead)
async def reject_review(
    review_id: int,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> ReviewRead:
    """
    Reject a review.
    
    SQL: UPDATE reviews SET is_approved = false WHERE review_id = :review_id RETURNING *
    """
    result = await session.execute(
        text("SELECT * FROM reviews WHERE review_id = :review_id"),
        {"review_id": review_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    result = await session.execute(
        text("UPDATE reviews SET is_approved = false WHERE review_id = :review_id RETURNING *"),
        {"review_id": review_id}
    )
    review = result.mappings().one()
    await session.commit()
    return dict(review)
