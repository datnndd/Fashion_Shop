import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from supabase import create_client, Client
from app.core.config import settings

class SupabaseStorage:
    def __init__(self):
        self.client: Client = None
        import os
        print(f"Storage Init - CWD: {os.getcwd()}")
        print(f"Storage Init - Supabase URL: {settings.supabase_url[:10] if settings.supabase_url else 'None'}...")
        
        if settings.supabase_url and settings.supabase_key:
            try:
                self.client = create_client(settings.supabase_url, settings.supabase_key)
            except Exception as e:
                print(f"Failed to initialize Supabase client: {e}")
        else:
            print("Supabase URL or Key not provided in settings.")
        
        self.bucket = settings.supabase_bucket

    async def upload(self, file: UploadFile) -> str:
        if not self.client:
             raise HTTPException(status_code=500, detail="Server configuration error: Supabase not configured")

        file_extension = Path(file.filename).suffix
        file_name = f"{uuid.uuid4()}{file_extension}"
        
        try:
            # Read file content
            content = await file.read()
            
            # Upload to Supabase Storage
            # Note: supabase-py storage upload expects bytes or a file-like object.
            # We'll map the path to just the filename for root of bucket
            res = self.client.storage.from_(self.bucket).upload(
                path=file_name,
                file=content,
                file_options={"content-type": file.content_type}
            )
            
            # Get public URL
            # The get_public_url method returns a string URL
            public_url = self.client.storage.from_(self.bucket).get_public_url(file_name)
            
            # Return the file name or URL depending on what the frontend expects.
            # But the user complains it saves to @[uploads], so they probably want the URL to be remote.
            # Currently it returns {"url": "/uploads/..."}. 
            # I should return the full URL.
            return public_url
            
        except Exception as e:
            # If upload fails, try details
            error_msg = str(e)
            if hasattr(e, 'message'):
                error_msg = e.message
            raise HTTPException(status_code=500, detail=f"Failed to upload to Supabase: {error_msg}")
        finally:
            await file.seek(0) # Reset file pointer if needed, though we consumed it.

storage = SupabaseStorage()
