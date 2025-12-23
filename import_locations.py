
import asyncio
import json
import os
import sys

# Add the project root to the python path so we can import app modules
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.location import Province, Ward

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def main():
    file_path = "danhmucxaphuong.json"
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return

    print("Reading JSON file...")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    async with AsyncSessionLocal() as session:
        for province_data in data:
            p_code = str(province_data.get("matinhBNV"))
            p_name = province_data.get("tentinhmoi")
            
            # Upsert Province
            stmt = select(Province).where(Province.code == p_code)
            result = await session.execute(stmt)
            province = result.scalar_one_or_none()
            
            if not province:
                province = Province(code=p_code, name=p_name)
                session.add(province)
                print(f"Adding Province: {p_name} ({p_code})")
            else:
                if province.name != p_name:
                    province.name = p_name
                    print(f"Updating Province: {p_name} ({p_code})")
            
            # Flush to generate province.province_id if new
            await session.flush()
            
            # Process Wards
            wards_data = province_data.get("phuongxa", [])
            for ward_data in wards_data:
                w_code = str(ward_data.get("maphuongxa"))
                w_name = ward_data.get("tenphuongxa")
                
                stmt_w = select(Ward).where(Ward.code == w_code)
                result_w = await session.execute(stmt_w)
                ward = result_w.scalar_one_or_none()
                
                if not ward:
                    ward = Ward(
                        code=w_code, 
                        name=w_name, 
                        province_id=province.province_id
                    )
                    session.add(ward)
                    # print(f"  Adding Ward: {w_name} ({w_code})")
                else:
                    updated = False
                    if ward.name != w_name:
                        ward.name = w_name
                        updated = True
                    if ward.province_id != province.province_id:
                        ward.province_id = province.province_id
                        updated = True
                    # if updated:
                        # print(f"  Updating Ward: {w_name} ({w_code})")
            
            # Commit after each province to save progress/keep transaction size reasonable
            await session.commit()
            
    print("Import completed successfully.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        import traceback
        with open("error_log.txt", "w") as f:
            f.write(traceback.format_exc())
        print("An error occurred. Check error_log.txt")
