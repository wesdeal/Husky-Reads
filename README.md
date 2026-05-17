# HuskyReads

A personal book tracking app. Search millions of books via the OpenLibrary API, save them to reading shelves, and manage your reading history.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router |
| Backend | FastAPI, SQLAlchemy, PostgreSQL |
| Auth | JWT + Argon2 password hashing |
| Book Data | [OpenLibrary API](https://openlibrary.org/developers/api) |

## Features

- Search books by title, author, or keyword
- View detailed book pages (cover, summary, subjects, publish date)
- Save books to shelves with statuses: `want_to_read`, `reading`, `read`
- User accounts with profiles (bio, profile picture)
- JWT-based authentication

## Project Structure

```
HuskyReads/
├── backend/
│   ├── main.py              # FastAPI app + all endpoints
│   ├── db_queries.py        # Database query helpers
│   ├── jwt_utils.py         # Token creation & auth dependency
│   ├── create_tables.py     # One-time DB setup script
│   └── database/
│       ├── models.py        # SQLAlchemy models (User, Book, UserBook)
│       ├── schemas.py       # Pydantic request/response schemas
│       └── database.py      # DB engine & session
└── husky-reads/
    └── src/
        ├── pages/           # HomePage, SearchPage, BookDetailPage, ProfilePage, etc.
        ├── components/      # BookCard, Shelf, Navbar, SearchBar, etc.
        ├── auth/            # AuthContext (JWT storage & user state)
        └── hooks/           # useShelfData
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

### Backend

```bash
cd backend

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary httpx passlib[argon2] python-jose python-dotenv

# Create a .env file
echo "DATABASE_URL=postgresql+psycopg2://<user>@localhost:5432/huskyreads" > .env
echo 'SECRET_KEY="your-secret-key"' >> .env

# Create the database
createdb huskyreads

# Run the table setup script (one time)
python create_tables.py

# Start the server
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd husky-reads

npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/search?q=<query>` | Search books via OpenLibrary |
| `GET` | `/book/{book_id}` | Get full book details |
| `POST` | `/signup` | Create a new account |
| `POST` | `/login` | Login and receive JWT |
| `GET` | `/user/me` | Get authenticated user's profile |
| `PATCH` | `/user/me` | Update profile |
| `POST` | `/user/books` | Add a book to your shelf |
| `GET` | `/user/books` | List shelf (optional `?status=` filter) |
| `PATCH` | `/user/books/{id}` | Update a book's reading status |
| `DELETE` | `/user/books/{id}` | Remove a book from shelf |

## Database Schema

- **users** — account credentials and profile info
- **books** — cached book metadata from OpenLibrary
- **user_books** — join table linking users to books with a reading `status`
