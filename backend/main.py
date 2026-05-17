import sys
from pathlib import Path
from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import httpx
from passlib.context import CryptContext
from typing import Optional, Literal

# Add backend directory to path so imports work when running directly
backend_dir = Path(__file__).parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# define app
app = FastAPI()

origins = [
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:5173",  # Vite default with IP
    "http://localhost:3000",  # CRA default
    "http://localhost:8000",  # FastAPI default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


""" 
===========================================================================================
Frontend / OpenLibrary API Endpoints
===========================================================================================
 """

@app.get("/search")
async def search_books(q: str = Query(..., min=5), limit: int = 10):
    
    # OpenLibrary URL
    print("Searching for:", q)  # Debug print
    url = "https://openlibrary.org/search.json"
    params = {"q": q, "limit": limit}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        print("OpenLibrary response status:", response.status_code)  # Debug print
        response.raise_for_status()
        data = response.json()

    books = []
    for doc in data.get("docs", []):
        title = doc.get("title")
        print("Book title found:", title)  # Debug print
        author = doc.get("author_name", ["Unknown"])[0]
        cover_i = doc.get("cover_i") # identifier for cover image       
        cover_url = (f"https://covers.openlibrary.org/b/id/{cover_i}-M.jpg" if cover_i else None)
        key = doc.get("key")  # Unique key for the book; in form of "/works/OLxxxxW"
        print("Cover URL:", cover_url)  # Debug print
        books.append({
            "title": title,
            "author": author,
            "cover_url": cover_url,
            "id": key.split("/")[-1] if key else None
        })

    print(f"Book Title and ID: {[(book['title'], book['id']) for book in books]}")  # Debug print

    return books


@app.get("/book/{book_id}")
async def get_book_details(book_id: str):
    print("Fetching details for book ID:", book_id)  # Debug print
    works_url = f"https://openlibrary.org/works/{book_id}.json"
    print("Works URL:", works_url)  # Debug print

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(works_url)
            print("Works status code:", response.status_code)
            response.raise_for_status()
            main_data = response.json()
            print("Main data title:", main_data.get("title"))
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="OpenLibrary request timed out")
        except httpx.HTTPStatusError as e:
            print(f"HTTP error fetching works data: {e}")
            raise HTTPException(status_code=404, detail=f"Book not found: {e}")
        except Exception as e:
            print(f"Unexpected error fetching works data: {e}")
            raise HTTPException(status_code=500, detail="Unexpected backend error")

    # Fetch author details
    authors = []
    author_keys = main_data.get("authors", [])

    async with httpx.AsyncClient(timeout=10.0) as client:
        for author_ref in author_keys:
            author_key = author_ref.get("author", {}).get("key") if isinstance(author_ref.get("author"), dict) else author_ref.get("author")
            if author_key:
                try:
                    author_url = f"https://openlibrary.org{author_key}.json"
                    author_response = await client.get(author_url)
                    author_response.raise_for_status()
                    author_data = author_response.json()
                    authors.append(author_data.get("name", "Unknown"))
                except Exception as e:
                    print(f"Error fetching author: {e}")
                    authors.append("Unknown")

    # Get cover URL from the first cover ID
    covers = main_data.get("covers", [])
    cover_url = f"https://covers.openlibrary.org/b/id/{covers[0]}-L.jpg" if covers else None

    book_details = {
        "year_published": main_data.get("first_publish_date"),
        "title": main_data.get("title"),
        "summary": main_data.get("description", {}).get("value") if isinstance(main_data.get("description"), dict) else main_data.get("description"),
        "subjects": main_data.get("subjects", []),
        "cover_url": cover_url,
        "authors": authors if authors else ["Unknown"]
    }

    return book_details


"""
===========================================================================================
                Database API Endpoints
==========================================================================================
"""

from database.models import User, Book, UserBook
from database.schemas import UserCreate, UserResponse, UserUpdate, LoginRequest, LoginResponse, UserBookCreate, UserBookUpdate, UserBookResponse
from database.database import SessionLocal

from db_queries import get_user_by_username, update_user_profile, get_user_books, get_user_book, create_user_book, update_user_book, delete_user_book
from jwt_utils import create_access_token, get_current_user

# Password hashing setup
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/signup", response_model=UserResponse)
async def signup_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account"""

    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Create new user
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    print(f"New user created: {db_user.username}")  # Debug print
    return db_user



@app.post("/login")
def login_user(creds: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_username(creds.username, db) # check if username exists
    if not user or not pwd_context.verify(creds.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_access_token(subject = user.username)
    get_current_user(token)
    return {"access_token":token, "token_type":"bearer"}



@app.get("/user/me", response_model=UserResponse)
def get_my_profile(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the authenticated user's full profile"""
    user = get_user_by_username(username, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.patch("/user/me", response_model=UserResponse)
def update_my_profile(data: UserUpdate, username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update the authenticated user's profile fields"""
    user = get_user_by_username(username, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return update_user_profile(user, data, db)


"""
===========================================================================================
                User Books Endpoints
===========================================================================================
"""

@app.post("/user/books", response_model=UserBookResponse, status_code=201)
def add_user_book(
    book: UserBookCreate, #key, title, author. cover url, status taken care of.
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a book to the authenticated user's shelf"""

    user = get_user_by_username(username, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return create_user_book(user.id, book, db)


@app.get("/user/books", response_model=list[UserBookResponse])
def list_user_books(
    username: str = Depends(get_current_user),
    status: Optional[str] = None,  # status will be None for listing all books (List all books button) not none for shelves
    db: Session = Depends(get_db),
):
    """Return all books on the authenticated user's shelf"""
    print(f"Listing books for user: {username} with status filter: {status}")  # Debug print
    user = get_user_by_username(username, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_user_books(user.id, status, db)



@app.patch("/user/books/{book_id}", response_model=UserBookResponse)
def update_book_status(
    book_id: int,
    update: UserBookUpdate,
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the reading status of a saved book"""
    user = get_user_by_username(username, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return update_user_book(book_id, user.id, update, db)


@app.delete("/user/books/{book_id}", status_code=204)
def remove_user_book(
    book_id: int,
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a book from the authenticated user's shelf"""
    user = get_user_by_username(username, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    delete_user_book(book_id, user.id, db)
    
    
    
    

    



    

    
    
