import { useState } from "react"
import { useAuth } from "../../auth/AuthContext"
import { API } from "../../api"

const SHELF_OPTIONS = [
  { label: "Currently Reading", value: "reading" },
  { label: "Want to Read", value: "want_to_read" },
  { label: "Have Read", value: "finished" },
]

function BookCard({ bookKey, title, author, coverUrl }) {
  const { token } = useAuth()
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleAddToShelf(e, status) {
    e.preventDefault()
    e.stopPropagation()
    if (!token) {
      alert("Please log in to add books to your shelf.")
      setOpen(false)
      return
    }
    setSaving(true)
    try {
      await fetch(`${API}/user/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          book_key: bookKey,
          title,
          author,
          cover_url: coverUrl,
          status,
        }),
      })
      setSaved(SHELF_OPTIONS.find((o) => o.value === status)?.label ?? status)
    } finally {
      setSaving(false)
      setOpen(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Cover */}
      <div className="aspect-[2/3] bg-gray-100 w-full flex items-center justify-center overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm">No Cover</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{author}</p>
        </div>

        {/* Add to shelf */}
        <div className="relative mt-auto">
          {saved ? (
            <span className="block w-full text-center text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg py-1.5 px-2 font-medium">
              ✓ {saved}
            </span>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setOpen((v) => !v)
                }}
                disabled={saving}
                className="w-full text-xs font-medium bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg py-1.5 px-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                {saving ? "Saving…" : "Add to Shelf ▾"}
              </button>

              {open && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-10">
                  {SHELF_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={(e) => handleAddToShelf(e, opt.value)}
                      className="w-full text-left text-xs px-3 py-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookCard
