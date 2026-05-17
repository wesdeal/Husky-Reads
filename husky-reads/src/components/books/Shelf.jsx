import BookCard from "./BookCard"

function Shelf({ title, books = [] }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full bg-indigo-500" />
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <span className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
          {books.length}
        </span>
        <button className="ml-auto text-sm text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">
          View all ›
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.length > 0 ? (
          books.map((book) => (
            <BookCard
              key={book.id}
              bookKey={book.book_key}
              title={book.title}
              author={book.author}
              coverUrl={book.cover_url}
            />
          ))
        ) : (
          <p className="text-gray-400 text-sm col-span-full">No books here yet.</p>
        )}
      </div>
    </div>
  )
}

export default Shelf
