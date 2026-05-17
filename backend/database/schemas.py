from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Literal


# ===== USER SCHEMAS =====

class UserBase(BaseModel):
    """Base schema for User - shared fields"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user (includes password)"""
    
    password: str = Field(..., min_length=8)
    full_name: str | None = None



class UserUpdate(BaseModel):
    """Schema for updating user profile (all fields optional)"""
    full_name: str | None = None
    bio: str | None = None
    profile_picture_url: str | None = None


class UserResponse(UserBase):
    """Schema for returning user data (no password)"""
    id: int
    full_name: str | None = None
    bio: str | None = None
    profile_picture_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ===== BOOK SCHEMAS =====

class BookBase(BaseModel):
    """Base schema for Book - shared fields"""
    title: str
    author: str
    isbn: str | None = None
    cover_url: str | None = None


class BookCreate(BookBase):
    """Schema for creating a new book"""
    openlibrary_id: str | None = None
    year_published: int | None = None
    summary: str | None = None
    subjects: list[str] | None = None


class BookUpdate(BaseModel):
    """Schema for updating book information (all fields optional)"""
    title: str | None = None
    author: str | None = None
    isbn: str | None = None
    cover_url: str | None = None
    year_published: int | None = None
    summary: str | None = None
    subjects: list[str] | None = None


class BookResponse(BookBase):
    """Schema for returning book data"""
    id: int
    openlibrary_id: str | None = None
    year_published: int | None = None
    summary: str | None = None
    subjects: list[str] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ===== USER BOOK SCHEMAS =====

ReadingStatus = Literal["want_to_read", "reading", "finished"]


class UserBookCreate(BaseModel):
    """Schema for adding a book to the user's shelf"""
    book_key: str = Field(..., description="OpenLibrary work key, e.g. OL45804W")
    title: str
    author: str
    cover_url: str | None = None
    status: ReadingStatus = "want_to_read"


class UserBookUpdate(BaseModel):
    """Schema for updating a saved book's status"""
    status: ReadingStatus


class UserBookResponse(BaseModel):
    """Schema for returning a saved user book"""
    id: int
    user_id: int
    book_key: str
    title: str
    author: str
    cover_url: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


