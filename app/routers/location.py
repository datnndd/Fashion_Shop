from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_current_user
from app.models.location import Province, UserAddress, Ward
from app.models.user import User
from app.schemas.location import (
    ProvinceCreate,
    ProvinceRead,
    UserAddressCreate,
    UserAddressRead,
    UserAddressCreateMe,
    UserAddressUpdate,
    WardCreate,
    WardRead,
)

router = APIRouter(prefix="/locations", tags=["locations"])


@router.post("/provinces", response_model=ProvinceRead, status_code=status.HTTP_201_CREATED)
async def create_province(payload: ProvinceCreate, session: AsyncSession = Depends(get_session)) -> ProvinceRead:
    province = Province(code=payload.code, name=payload.name)
    session.add(province)
    await session.commit()
    await session.refresh(province)
    return province


@router.get("/provinces", response_model=list[ProvinceRead])
async def list_provinces(session: AsyncSession = Depends(get_session)) -> list[ProvinceRead]:
    result = await session.scalars(select(Province))
    return list(result.all())


@router.post("/wards", response_model=WardRead, status_code=status.HTTP_201_CREATED)
async def create_ward(payload: WardCreate, session: AsyncSession = Depends(get_session)) -> WardRead:
    province = await session.get(Province, payload.province_id)
    if not province:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Province not found")

    ward = Ward(province_id=payload.province_id, code=payload.code, name=payload.name)
    session.add(ward)
    await session.commit()
    await session.refresh(ward)
    return ward


@router.get("/provinces/{province_id}/wards", response_model=list[WardRead])
async def list_wards(province_id: int, session: AsyncSession = Depends(get_session)) -> list[WardRead]:
    result = await session.scalars(select(Ward).where(Ward.province_id == province_id))
    return list(result.all())


@router.post("/addresses", response_model=UserAddressRead, status_code=status.HTTP_201_CREATED)
async def create_address(payload: UserAddressCreate, session: AsyncSession = Depends(get_session)) -> UserAddressRead:
    user = await session.get(User, payload.user_id)
    province = await session.get(Province, payload.province_id)
    ward = await session.get(Ward, payload.ward_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not province:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Province not found")
    if not ward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ward not found")
    if ward.province_id != province.province_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ward does not belong to province")

    if payload.is_default:
        await session.execute(
            update(UserAddress).where(UserAddress.user_id == payload.user_id).values(is_default=False)
        )

    address = UserAddress(
        user_id=payload.user_id,
        province_id=payload.province_id,
        ward_id=payload.ward_id,
        street=payload.street,
        full_address=payload.full_address,
        is_default=payload.is_default,
    )
    session.add(address)
    await session.commit()
    await session.refresh(address)
    return address


@router.get("/users/{user_id}/addresses", response_model=list[UserAddressRead])
async def list_user_addresses(user_id: int, session: AsyncSession = Depends(get_session)) -> list[UserAddressRead]:
    result = await session.scalars(select(UserAddress).where(UserAddress.user_id == user_id))
    return list(result.all())


# ==================== User's own addresses ====================

@router.get("/me/addresses", response_model=list[UserAddressRead])
async def get_my_addresses(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[UserAddressRead]:
    """Get current user's addresses."""
    result = await session.scalars(
        select(UserAddress).where(UserAddress.user_id == current_user.user_id)
    )
    return list(result.all())


@router.post("/me/addresses", response_model=UserAddressRead, status_code=status.HTTP_201_CREATED)
async def create_my_address(
    payload: UserAddressCreateMe,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> UserAddressRead:
    """Create a new address for current user."""
    province = await session.get(Province, payload.province_id)
    ward = await session.get(Ward, payload.ward_id)
    
    if not province:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Province not found")
    if not ward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ward not found")
    if ward.province_id != province.province_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ward does not belong to province")

    if payload.is_default:
        await session.execute(
            update(UserAddress).where(UserAddress.user_id == current_user.user_id).values(is_default=False)
        )

    address = UserAddress(
        user_id=current_user.user_id,
        province_id=payload.province_id,
        ward_id=payload.ward_id,
        street=payload.street,
        full_address=payload.full_address,
        is_default=payload.is_default,
    )
    session.add(address)
    await session.commit()
    await session.refresh(address)
    return address


@router.put("/me/addresses/{address_id}", response_model=UserAddressRead)
async def update_my_address(
    address_id: int,
    payload: UserAddressUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> UserAddressRead:
    """Update current user's address."""
    address = await session.get(UserAddress, address_id)
    
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    if address.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own addresses")
    
    if payload.province_id is not None:
        province = await session.get(Province, payload.province_id)
        if not province:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Province not found")
        address.province_id = payload.province_id
    
    if payload.ward_id is not None:
        ward = await session.get(Ward, payload.ward_id)
        if not ward:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ward not found")
        # Validate ward belongs to province
        if ward.province_id != (payload.province_id or address.province_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ward does not belong to province")
        address.ward_id = payload.ward_id
    
    if payload.street is not None:
        address.street = payload.street
    if payload.full_address is not None:
        address.full_address = payload.full_address
    if payload.is_default is not None:
        if payload.is_default:
            # Unset other default addresses
            await session.execute(
                update(UserAddress)
                .where(UserAddress.user_id == current_user.user_id)
                .where(UserAddress.address_id != address_id)
                .values(is_default=False)
            )
        address.is_default = payload.is_default
    
    await session.commit()
    await session.refresh(address)
    return address


@router.delete("/me/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_address(
    address_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Delete current user's address."""
    address = await session.get(UserAddress, address_id)
    
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    if address.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own addresses")
    
    await session.delete(address)
    await session.commit()
    return None
