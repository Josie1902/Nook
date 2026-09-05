import uuid


def generate_storage_key(user_id: str, filename: str) -> str:
    safe_filename = filename.replace("/", "_")
    return f"{user_id}/{uuid.uuid4()}_{safe_filename}"