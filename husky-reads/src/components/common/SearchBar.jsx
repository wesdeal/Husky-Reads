function SearchBar({ placeholder = "Search for books...", onSearch }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        onChange={(e) => onSearch && onSearch(e.target.value)}
      />
    </div>
  )
}

export default SearchBar
