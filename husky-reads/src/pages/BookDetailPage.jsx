import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import Dropdown from "../components/common/Dropdown"
import BookCard from "../components/books/BookCard"
import { useAuth } from "../auth/AuthContext"

function renderSummary(text) {
  if (!text) return ""
  return text.replace(/\*([^*]+)\*/g, "<em>$1</em>")
}

function StarRating({ rating, onRate }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onRate(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className={`text-3xl transition-colors cursor-pointer leading-none ${
            n <= (hovered || rating) ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function BookDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userBook, setUserBook] = useState(null)
  const [rating, setRating] = useState(0)
  const [moreBooks, setMoreBooks] = useState([])
  const [moreBooksLoading, setMoreBooksLoading] = useState(false)

  useEffect(() => {
    async function fetchBookDetails() {
      try {
        const response = await fetch(`http://localhost:8000/book/${id}`)
        const data = await response.json()
        setBook(data)
      } catch (error) {
        console.error("Error fetching book details:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBookDetails()
  }, [id])

  useEffect(() => {
    if (!token) return
    async function fetchUserBook() {
      try {
        const res = await fetch("http://localhost:8000/user/books", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const books = await res.json()
        const found = books.find((b) => b.book_key === id)
        if (found) {
          setUserBook(found)
          setRating(found.rating ?? 0)
        }
      } catch (e) {
        console.error("Error fetching user books:", e)
      }
    }
    fetchUserBook()
  }, [token, id])

  useEffect(() => {
    if (!book?.authors?.[0]) return
    async function fetchMoreBooks() {
      setMoreBooksLoading(true)
      try {
        const authorName = book.authors[0]
        const res = await fetch(
          `https://openlibrary.org/search.json?author=${encodeURIComponent(authorName)}&limit=8`
        )
        const data = await res.json()
        const filtered = (data.docs ?? [])
          .filter((doc) => doc.key?.split("/").pop() !== id)
          .slice(0, 6)
          .map((doc) => ({
            bookKey: doc.key?.split("/").pop(),
            title: doc.title,
            author: doc.author_name?.[0] ?? "Unknown",
            coverUrl: doc.cover_i
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
              : null,
          }))
        setMoreBooks(filtered)
      } catch (e) {
        console.error("Error fetching more books:", e)
      } finally {
        setMoreBooksLoading(false)
      }
    }
    fetchMoreBooks()
  }, [book, id])

  async function handleRate(stars) {
    setRating(stars)
    if (!userBook) return
    try {
      await fetch(`http://localhost:8000/user/books/${userBook.id}/rating`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: stars }),
      })
    } catch (e) {
      console.error("Error saving rating:", e)
    }
  }

  async function addUserBook(status) {
    if (!token) {
      alert("Please log in to add books to your collection.")
      return
    }
    await fetch("http://localhost:8000/user/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        book_key: id,
        title: book.title,
        author: book.authors[0],
        cover_url: book.cover_url,
        status,
      }),
    })
    // Re-check shelf so the rating widget appears immediately after adding
    if (token) {
      try {
        const res = await fetch("http://localhost:8000/user/books", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const books = await res.json()
        const found = books.find((b) => b.book_key === id)
        if (found) setUserBook(found)
      } catch (e) {
        console.error("Error refreshing user book:", e)
      }
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </>
    )
  }

  if (!book) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-gray-600">Book not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero: cover + book info */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">

          {/* Cover */}
          <div className="md:w-1/3 shrink-0">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={`${book.title} cover`}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-2/3 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No Cover Available</span>
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-1">
              by {book?.authors?.join(", ") || "Unknown"}
            </p>
            {book.year_published && (
              <p className="text-gray-500 mb-5">Published: {book.year_published}</p>
            )}

            {/* Add to shelf */}
            <div className="mb-5">
              <Dropdown onSelectStatus={addUserBook} />
            </div>

            {/* Star rating — only when this book is on the user's shelf */}
            {userBook && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Your rating</p>
                <StarRating rating={rating} onRate={handleRate} />
              </div>
            )}

            {/* Summary */}
            {book.summary && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Summary</h2>
                <p
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderSummary(book.summary) }}
                />
              </div>
            )}
          </div>
        </div>

        {/* More by this author */}
        {(moreBooksLoading || moreBooks.length > 0) && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              More by {book.authors?.[0]}
            </h2>
            {moreBooksLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {moreBooks.map((b) => (
                  <Link
                    key={b.bookKey}
                    to={`/book/${b.bookKey}`}
                    className="flex-none w-40 block"
                  >
                    <BookCard
                      bookKey={b.bookKey}
                      title={b.title}
                      author={b.author}
                      coverUrl={b.coverUrl}
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  )
}

export default BookDetailPage
