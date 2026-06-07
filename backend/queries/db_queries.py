from database.models import User, Book, UserBook
from database.schemas import UserCreate, UserResponse, LoginRequest, LoginResponse, UserBookCreate, UserBookUpdate, UserUpdate
from database.database import SessionLocal
from sqlalchemy.orm import Session
from fastapi import FastAPI, Query, HTTPException, Depends

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_by_username(username: str, db: Session) -> User | None:
    return db.query(User).filter(User.username == username).first()


def update_user_profile(user: User, data: UserUpdate, db: Session) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


# ===== USER BOOK QUERIES =====
""" list of books with status """
"""  """
def get_user_books(user_id: int, status: str, db: Session) -> list[UserBook]:
    if status is not None:
        return db.query(UserBook).filter(UserBook.user_id == user_id, UserBook.status == status).all()
    else:
        return db.query(UserBook).filter(UserBook.user_id == user_id).all()


""" single book for favorite book on profile """
def get_user_book(book_id: int, user_id: int, db: Session) -> UserBook | None:
    return db.query(UserBook).filter(UserBook.id == book_id, UserBook.user_id == user_id).first()


def create_user_book(user_id: int, data: UserBookCreate, db: Session) -> UserBook:
    existing = db.query(UserBook).filter(UserBook.user_id == user_id, UserBook.book_key == data.book_key, UserBook.status == data.status).first()
    if existing:
        raise HTTPException(status_code=409, detail="Book already saved to your shelf")
    db_book = UserBook(
        user_id=user_id,
        book_key=data.book_key,
        title=data.title,
        author=data.author,
        cover_url=data.cover_url,
        status=data.status,
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


def update_user_book(book_id: int, user_id: int, data: UserBookUpdate, db: Session) -> UserBook:
    db_book = get_user_book(book_id, user_id, db)
    if not db_book:
        raise HTTPException(status_code=404, detail="Saved book not found")
    db_book.status = data.status
    db.commit()
    db.refresh(db_book)
    return db_book


def delete_user_book(book_id: int, user_id: int, db: Session) -> None:
    db_book = get_user_book(book_id, user_id, db)
    if not db_book:
        raise HTTPException(status_code=404, detail="Saved book not found")
    db.delete(db_book)
    db.commit()


