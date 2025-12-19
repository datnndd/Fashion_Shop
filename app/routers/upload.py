"""
Image upload router for handling file uploads.
"""
import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import APIRouter, HTTPException, UploadFile, status

router = APIRouter(prefix="/upload", tags=["upload"])

# Configure upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def validate_file(file: UploadFile) -> None:
    """Validate uploaded file."""
    # Check extension
    ext = Path(file.filename).suffix.lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )


@router.post("/images")
async def upload_images(files: list[UploadFile]) -> dict:
    """
    Upload multiple images.
    Returns list of URLs for the uploaded images.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided"
        )

    uploaded_urls = []

    for file in files:
        # Validate file
        validate_file(file)

        # Generate unique filename
        ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = UPLOAD_DIR / unique_filename

        # Read and validate size
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} exceeds maximum size of 5MB"
            )

        # Save file
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        # Generate URL
        url = f"/uploads/{unique_filename}"
        uploaded_urls.append(url)

    return {"urls": uploaded_urls}


@router.post("/image")
async def upload_single_image(file: UploadFile) -> dict:
    """Upload a single image. Returns the URL."""
    result = await upload_images([file])
    return {"url": result["urls"][0]}
