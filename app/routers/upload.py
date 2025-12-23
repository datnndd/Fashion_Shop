from typing import List

from fastapi import APIRouter, File, UploadFile, HTTPException
from app.utils.storage import storage

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        url = await storage.upload(file)
        return {"url": url}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/images")
async def upload_images(files: List[UploadFile] = File(...)):
    urls = []
    try:
        for file in files:
            url = await storage.upload(file)
            urls.append(url)
            
        return {"urls": urls}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
