import { useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import BookCard from "../components/books/BookCard"
import { API } from "../api"

function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    console.log("Searching for:", query)
    setLoading(true)
    setSearched(true)
    try {
      const response = await fetch(
        `${API}/search?q=${encodeURIComponent(query)}&limit=10`
      )
      const data = await response.json()
      setResults(data)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Read</h1>
        <p className="text-gray-500 mb-8">Search any book title or author name.</p>

        {/* Search input */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition mb-10">
          <svg
            className="w-5 h-5 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search books or authors…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base py-1"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-lg px-4 py-1.5 transition-colors cursor-pointer shrink-0"
          >
            Search
          </button>
        </div>

        {/* Results area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <svg
              className="w-10 h-10 animate-spin mb-4 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <p className="text-sm">Searching…</p>
          </div>
        ) : !searched ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <svg
              className="w-14 h-14 mb-4 text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-lg font-medium text-gray-500">Search for any book or author</p>
            <p className="text-sm mt-1">Results will appear here</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <p className="text-lg font-medium text-gray-500">No results found</p>
            <p className="text-sm mt-1">Try a different title or author name</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {results.map((book) => (
              <Link to={`/book/${book.id}`} key={book.id} className="block">
                <BookCard
                  bookKey={book.id}
                  title={book.title}
                  author={book.author}
                  coverUrl={book.cover_url}
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default SearchPage
