from database.models import User
from database.schemas import UserUpdate
from sqlalchemy.orm import Session


def get_user_by_username(username: str, db: Session) -> User | None:
    return db.query(User).filter(User.username == username).first()


def update_user_profile(user: User, data: UserUpdate, db: Session) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
