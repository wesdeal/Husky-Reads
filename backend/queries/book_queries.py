from database.models import UserBook
from database.schemas import UserBookCreate, UserBookUpdate
from sqlalchemy.orm import Session
from fastapi import HTTPException


def get_user_books(user_id: int, status: str, db: Session) -> list[UserBook]:
    if status is not None:
        return db.query(UserBook).filter(UserBook.user_id == user_id, UserBook.status == status).all()
    else:
        return db.query(UserBook).filter(UserBook.user_id == user_id).all()


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
