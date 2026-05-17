"""
Script to create database tables based on SQLAlchemy models
Run this once to set up your database schema
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from database.database import engine, Base
from database.models import User, Book, UserBook

def create_tables():
    """Create all tables in the database"""
    print("Creating database tables...")

    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Tables created successfully!")
        print("\nCreated tables:")
        print("  - users")
        print("  - books")
        print("  - user_books")

    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        return False

    return True

if __name__ == "__main__":
    create_tables()
