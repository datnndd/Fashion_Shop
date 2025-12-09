from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.location import Province, UserAddress, Ward
from app.models.user import User
from app.schemas.location import (
    ProvinceCreate,
    ProvinceRead,
    UserAddressCreate,
    UserAddressRead,
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
