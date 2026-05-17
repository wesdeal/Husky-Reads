import { Link } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import { useAuth } from "../auth/AuthContext"
import { useShelfData } from "../hooks/useShelfData"

function BookRow({ books, maxBooks }) {
  const displayed = maxBooks ? books.slice(0, maxBooks) : books
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
      {displayed.map((book, i) => (
        <div key={i} className="flex-none w-28">
          <div className="aspect-2/3 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center px-2">
                No Cover
              </div>
            )}
          </div>
          <h3 className="text-xs font-semibold mt-1.5 leading-snug line-clamp-2 text-gray-800">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{book.author}</p>
        </div>
      ))}
    </div>
  )
}

function EmptyShelfState({ message }) {
  return (
    <div className="py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <p className="text-gray-500 text-sm mb-2">{message}</p>
      <Link
        to="/search"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline-offset-2 hover:underline"
      >
        Browse books in Search
      </Link>
    </div>
  )
}

function HomePage() {
  const { user, token, authLoading } = useAuth()
  const username = user?.sub

  const { readingBooks, wantToReadBooks, finishedBooks, loading } = useShelfData(token)

  const isLoggedIn = !!token

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400">Loading…</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">

        {/* Hero */}
        <div className="pt-16 pb-10 text-center px-4">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">HuskyReads</h1>
          <p className="text-xl text-gray-600">
            {isLoggedIn
              ? `Welcome back, ${username}!`
              : "Your UConn Book Review & Tracking App"}
          </p>
          {!isLoggedIn && (
            <div className="flex gap-3 justify-center mt-6">
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 bg-white hover:bg-gray-50 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors"
              >
                Log In
              </Link>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-4 pb-16 space-y-10">

          {isLoggedIn && !loading && (
            <>
              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Read", count: finishedBooks.length },
                  { label: "Reading", count: readingBooks.length },
                  { label: "Want to Read", count: wantToReadBooks.length },
                ].map(({ label, count }) => (
                  <div
                    key={label}
                    className="bg-white rounded-xl shadow-sm py-5 text-center"
                  >
                    <span className="block text-3xl font-bold text-indigo-600">
                      {count}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">{label}</span>
                  </div>
                ))}
              </div>

              {/* Currently Reading */}
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Currently Reading
                </h2>
                {readingBooks.length > 0 ? (
                  <BookRow books={readingBooks} />
                ) : (
                  <EmptyShelfState message="You're not reading anything right now." />
                )}
              </section>

              {/* Want to Read */}
              <section>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Want to Read</h2>
                  {wantToReadBooks.length > 4 && (
                    <Link
                      to="/profile"
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View all →
                    </Link>
                  )}
                </div>
                {wantToReadBooks.length > 0 ? (
                  <BookRow books={wantToReadBooks} maxBooks={4} />
                ) : (
                  <EmptyShelfState message="Your want-to-read list is empty." />
                )}
              </section>
            </>
          )}

          {isLoggedIn && loading && (
            <div className="text-center py-12 text-gray-400">Loading your shelves…</div>
          )}

          {/* Logged-out callout */}
          {!isLoggedIn && (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                Track your reading journey
              </h2>
              <p className="text-gray-500 mb-2">
                Keep a shelf of what you're reading, want to read, and have finished.
              </p>
              <p className="text-gray-500">
                Connect with fellow UConn readers and share reviews.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default HomePage
