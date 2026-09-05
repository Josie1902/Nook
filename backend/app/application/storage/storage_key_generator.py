import uuid


def generate_storage_key(user_id: uuid.UUID, filename: str) -> str:
    safe_filename = filename.replace("/", "_")
    return f"{user_id}/{uuid.uuid4()}_{safe_filename}"