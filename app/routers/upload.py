import shutil
import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        new_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / new_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"url": f"/uploads/{new_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/images")
async def upload_images(files: List[UploadFile] = File(...)):
    urls = []
    try:
        for file in files:
            # Generate unique filename
            file_extension = Path(file.filename).suffix
            new_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = UPLOAD_DIR / new_filename
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            urls.append(f"/uploads/{new_filename}")
            
        return {"urls": urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
