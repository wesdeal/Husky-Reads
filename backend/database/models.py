from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ARRAY, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    openlibrary_id = Column(String(100), unique=True, nullable=True, index=True)
    isbn = Column(String(20), nullable=True)
    title = Column(String(500), nullable=False)
    author = Column(String(500), nullable=False)
    cover_url = Column(String(500), nullable=True)
    year_published = Column(Integer, nullable=True)
    summary = Column(Text, nullable=True)
    subjects = Column(ARRAY(String), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class UserBook(Base):
    __tablename__ = "user_books"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_key = Column(String(100), nullable=False)  # OpenLibrary work key, e.g. "OL45804W"
    title = Column(String(500), nullable=False)
    author = Column(String(500), nullable=False)
    cover_url = Column(String(500), nullable=True)
    status = Column(String(50), nullable=False, default="want_to_read")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "book_key", name="uq_user_book"),
    )
