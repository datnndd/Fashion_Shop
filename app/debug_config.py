import os
from pathlib import Path
from app.core.config import settings

print(f"Current Working Directory: {os.getcwd()}")
print(f"Checking for .env at: {Path('app/.env').absolute()}")
print(f"File exists: {Path('app/.env').exists()}")

print(f"Supabase URL set: {bool(settings.supabase_url)}")
print(f"Supabase Key set: {bool(settings.supabase_key)}")
print(f"Supabase Bucket: {settings.supabase_bucket}")

# Try loading manually to see if dotenv works
try:
    from dotenv import load_dotenv
    print("Loading dotenv manually from app/.env")
    load_dotenv("app/.env")
    print(f"SUPABASE_URL env var: {bool(os.getenv('SUPABASE_URL'))}")
except ImportError:
    print("python-dotenv not installed")
