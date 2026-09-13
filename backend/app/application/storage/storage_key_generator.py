import uuid
import re

def sanitize_filename(filename: str) -> str:
    filename = filename.strip()
    # Keep only the filename, not any path components
    filename = filename.replace("\\", "/").split("/")[-1]
    # Replace unsafe characters with "_"
    filename = re.sub(r"[^A-Za-z0-9._-]", "_", filename)
    # Avoid repeated underscores
    filename = re.sub(r"_+", "_", filename)
    # Prevent weird leading/trailing characters
    filename = filename.strip("._- ")
    return filename or "file_pdf"

def generate_storage_key(user_id: str, filename: str) -> str:
    safe_filename = sanitize_filename(filename)
    return f"{user_id}/{uuid.uuid4()}_{safe_filename}"