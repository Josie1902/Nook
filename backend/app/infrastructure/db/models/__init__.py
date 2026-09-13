from app.infrastructure.db.models.user import BetterAuthUserModel
from app.infrastructure.db.models.book import BookModel
from app.infrastructure.db.base import Base

# Required for SQLAlchemy to recognize the models 
__all__ = [
    "BetterAuthUserModel",
    "BookModel",
] 

# For debugging purposes
# print(Base.metadata.tables.keys())