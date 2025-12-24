from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_current_user
from app.schemas.location import (
    ProvinceCreate,
    ProvinceRead,
    ShippingAddressCreate,
    ShippingAddressRead,
    ShippingAddressCreateMe,
    ShippingAddressUpdate,
    WardCreate,
    WardRead,
)

router = APIRouter(prefix="/locations", tags=["locations"])


# ==================== PROVINCES ====================

@router.post("/provinces", response_model=ProvinceRead, status_code=status.HTTP_201_CREATED)
async def create_province(payload: ProvinceCreate, session: AsyncSession = Depends(get_session)) -> ProvinceRead:
    """
    Create a new province.
    
    SQL: INSERT INTO provinces (code, name) VALUES (...) RETURNING *
    province = result.mappings().one()
    await session.commit()
    return dict(province)
    """
    result = await session.execute(
        text("INSERT INTO provinces (code, name) VALUES (:code, :name) RETURNING *"),
        {"code": payload.code, "name": payload.name}
    )
    province = result.mappings().one()
    await session.commit()
    return dict(province)


@router.get("/provinces", response_model=list[ProvinceRead])
async def list_provinces(session: AsyncSession = Depends(get_session)) -> list[ProvinceRead]:
    """
    List all provinces.
    
    SQL: SELECT * FROM provinces
    return [dict(p) for p in result.mappings().all()]
    """
    result = await session.execute(text("SELECT * FROM provinces"))
    return [dict(p) for p in result.mappings().all()]


# ==================== WARDS ====================

@router.post("/wards", response_model=WardRead, status_code=status.HTTP_201_CREATED)
async def create_ward(payload: WardCreate, session: AsyncSession = Depends(get_session)) -> WardRead:
    """
    Create a new ward.
    
    SQL: INSERT INTO wards (...) VALUES (...) RETURNING *
    ward = result.mappings().one()
    await session.commit()
    return dict(ward)
    """
    # Check province exists
    result = await session.execute(
        text("SELECT * FROM provinces WHERE province_id = :province_id"),
        {"province_id": payload.province_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Province not found")

    result = await session.execute(
        text("INSERT INTO wards (province_id, code, name) VALUES (:province_id, :code, :name) RETURNING *"),
        {"province_id": payload.province_id, "code": payload.code, "name": payload.name}
    )
    ward = result.mappings().one()
    await session.commit()
    return dict(ward)


@router.get("/provinces/{province_id}/wards", response_model=list[WardRead])
async def list_wards(province_id: int, session: AsyncSession = Depends(get_session)) -> list[WardRead]:
    """
    List all wards for a province.
    
    SQL: SELECT * FROM wards WHERE province_id = :province_id
    """
    result = await session.execute(
        text("SELECT * FROM wards WHERE province_id = :province_id"),
        {"province_id": province_id}
    )
    return [dict(w) for w in result.mappings().all()]


# ==================== ADDRESSES (Admin) ====================

@router.post("/shipping-addresses", response_model=ShippingAddressRead, status_code=status.HTTP_201_CREATED)
async def create_address(payload: ShippingAddressCreate, session: AsyncSession = Depends(get_session)) -> ShippingAddressRead:
    """
    Create a new shipping address for a user (admin endpoint).
    
    SQL: INSERT INTO shipping_addresses (...) VALUES (...) RETURNING *
    """
    # Check user exists
    user_result = await session.execute(
        text("SELECT * FROM users WHERE user_id = :user_id"),
        {"user_id": payload.user_id}
    )
    if not user_result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Check province exists
    province_result = await session.execute(
        text("SELECT * FROM provinces WHERE province_id = :province_id"),
        {"province_id": payload.province_id}
    )
    province = province_result.mappings().one_or_none()
    if not province:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Province not found")
    
    # Check ward exists
    ward_result = await session.execute(
        text("SELECT * FROM wards WHERE ward_id = :ward_id"),
        {"ward_id": payload.ward_id}
    )
    ward = ward_result.mappings().one_or_none()
    if not ward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ward not found")
    
    if ward["province_id"] != province["province_id"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ward does not belong to province")

    # Unset other default addresses if this one is default
    if payload.is_default:
        await session.execute(
            text("UPDATE shipping_addresses SET is_default = false WHERE user_id = :user_id"),
            {"user_id": payload.user_id}
        )

    # Insert address
    #user_id, province_id, ward_id, recipient_name, recipient_phone, 
    #street, full_address, is_default
    result = await session.execute(
        text("""
            INSERT INTO shipping_addresses (
                user_id, province_id, ward_id, recipient_name, recipient_phone, 
                street, full_address, is_default
            )
            VALUES (
                :user_id, :province_id, :ward_id, :recipient_name, :recipient_phone,
                :street, :full_address, :is_default
            )
            RETURNING *
        """),
        {
            "user_id": payload.user_id,
            "province_id": payload.province_id,
            "ward_id": payload.ward_id,
            "recipient_name": payload.recipient_name,
            "recipient_phone": payload.recipient_phone,
            "street": payload.street,
            "full_address": payload.full_address,
            "is_default": payload.is_default,
        }
    )
    address = result.mappings().one()
    await session.commit()
    return dict(address)


@router.get("/users/{user_id}/shipping-addresses", response_model=list[ShippingAddressRead])
async def list_user_addresses(user_id: int, session: AsyncSession = Depends(get_session)) -> list[ShippingAddressRead]:
    """
    List all shipping addresses for a user.
    
    SQL: SELECT * FROM shipping_addresses WHERE user_id = :user_id AND deleted_at IS NULL
    """
    result = await session.execute(
        text("SELECT * FROM shipping_addresses WHERE user_id = :user_id AND deleted_at IS NULL"),
        {"user_id": user_id}
    )
    return [dict(a) for a in result.mappings().all()]


# ==================== MY ADDRESSES (Current User) ====================

@router.get("/me/shipping-addresses", response_model=list[ShippingAddressRead])
async def get_my_addresses(
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> list[ShippingAddressRead]:
    """
    Get current user's shipping addresses.
    
    SQL: SELECT * FROM shipping_addresses WHERE user_id = :user_id AND deleted_at IS NULL
    """
    result = await session.execute(
        text("SELECT * FROM shipping_addresses WHERE user_id = :user_id AND deleted_at IS NULL"),
        {"user_id": current_user["user_id"]}
    )
    return [dict(a) for a in result.mappings().all()]


@router.post("/me/shipping-addresses", response_model=ShippingAddressRead, status_code=status.HTTP_201_CREATED)
async def create_my_address(
    payload: ShippingAddressCreateMe,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> ShippingAddressRead:
    """
    Create a new shipping address for current user.
    
    SQL: INSERT INTO shipping_addresses (...) VALUES (...) RETURNING *
    """
    # Check province exists
    province_result = await session.execute(
        text("SELECT * FROM provinces WHERE province_id = :province_id"),
        {"province_id": payload.province_id}
    )
    province = province_result.mappings().one_or_none()
    if not province:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Province not found")
    
    # Check ward exists
    ward_result = await session.execute(
        text("SELECT * FROM wards WHERE ward_id = :ward_id"),
        {"ward_id": payload.ward_id}
    )
    ward = ward_result.mappings().one_or_none()
    if not ward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ward not found")
    
    if ward["province_id"] != province["province_id"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ward does not belong to province")

    # Unset other default addresses if this one is default
    if payload.is_default:
        await session.execute(
            text("UPDATE shipping_addresses SET is_default = false WHERE user_id = :user_id"),
            {"user_id": current_user["user_id"]}
        )

    # Insert address
    #user_id, province_id, ward_id, recipient_name, recipient_phone, 
    #street, full_address, is_default
    result = await session.execute(
        text("""
            INSERT INTO shipping_addresses (
                user_id, province_id, ward_id, recipient_name, recipient_phone,
                street, full_address, is_default
            )
            VALUES (
                :user_id, :province_id, :ward_id, :recipient_name, :recipient_phone,
                :street, :full_address, :is_default
            )
            RETURNING *
        """),
        {
            "user_id": current_user["user_id"],
            "province_id": payload.province_id,
            "ward_id": payload.ward_id,
            "recipient_name": payload.recipient_name,
            "recipient_phone": payload.recipient_phone,
            "street": payload.street,
            "full_address": payload.full_address,
            "is_default": payload.is_default,
        }
    )
    address = result.mappings().one()
    await session.commit()
    return dict(address)


@router.put("/me/shipping-addresses/{address_id}", response_model=ShippingAddressRead)
async def update_my_address(
    address_id: int,
    payload: ShippingAddressUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> ShippingAddressRead:
    """
    Update current user's shipping address.
    
    SQL: UPDATE shipping_addresses SET ... WHERE shipping_address_id = :address_id AND deleted_at IS NULL RETURNING *
    """
    # Get address
    result = await session.execute(
        text("SELECT * FROM shipping_addresses WHERE shipping_address_id = :address_id AND deleted_at IS NULL"),
        {"address_id": address_id}
    )
    address = result.mappings().one_or_none()
    
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    if address["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own addresses")
    
    # Build dynamic update
    updates = []
    params = {"address_id": address_id}
    
    if payload.province_id is not None:
        province_result = await session.execute(
            text("SELECT * FROM provinces WHERE province_id = :province_id"),
            {"province_id": payload.province_id}
        )
        if not province_result.mappings().one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Province not found")
        updates.append("province_id = :province_id")
        params["province_id"] = payload.province_id
    
    if payload.ward_id is not None:
        ward_result = await session.execute(
            text("SELECT * FROM wards WHERE ward_id = :ward_id"),
            {"ward_id": payload.ward_id}
        )
        ward = ward_result.mappings().one_or_none()
        if not ward:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ward not found")
        # Check ward belongs to province
        target_province_id = payload.province_id if payload.province_id else address["province_id"]
        if ward["province_id"] != target_province_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ward does not belong to province")
        updates.append("ward_id = :ward_id")
        params["ward_id"] = payload.ward_id
        
    if payload.recipient_name is not None:
        updates.append("recipient_name = :recipient_name")
        params["recipient_name"] = payload.recipient_name
        
    if payload.recipient_phone is not None:
        updates.append("recipient_phone = :recipient_phone")
        params["recipient_phone"] = payload.recipient_phone
    
    if payload.street is not None:
        updates.append("street = :street")
        params["street"] = payload.street
    if payload.full_address is not None:
        updates.append("full_address = :full_address")
        params["full_address"] = payload.full_address
    if payload.is_default is not None:
        if payload.is_default:
            # Unset other defaults
            await session.execute(
                text("UPDATE shipping_addresses SET is_default = false WHERE user_id = :user_id AND shipping_address_id != :address_id"),
                {"user_id": current_user["user_id"], "address_id": address_id}
            )
        updates.append("is_default = :is_default")
        params["is_default"] = payload.is_default
    
    if not updates:
        return dict(address)
    
    result = await session.execute(
        text(f"UPDATE shipping_addresses SET {', '.join(updates)} WHERE shipping_address_id = :address_id AND deleted_at IS NULL RETURNING *"),
        params
    )
    updated_address = result.mappings().one()
    await session.commit()
    return dict(updated_address)


@router.delete("/me/shipping-addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_address(
    address_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
):
    """
    Delete current user's shipping address.
    
    SQL: UPDATE shipping_addresses SET deleted_at = NOW() WHERE shipping_address_id = :address_id
    """
    # Get address
    result = await session.execute(
        text("SELECT * FROM shipping_addresses WHERE shipping_address_id = :address_id AND deleted_at IS NULL"),
        {"address_id": address_id}
    )
    address = result.mappings().one_or_none()
    
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    if address["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own addresses")
    
    await session.execute(
        text("UPDATE shipping_addresses SET deleted_at = NOW() WHERE shipping_address_id = :address_id"),
        {"address_id": address_id}
    )
    await session.commit()
    return None
