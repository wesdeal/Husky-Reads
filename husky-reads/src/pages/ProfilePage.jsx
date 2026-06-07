import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import Navbar from "../components/layout/Navbar"
import Shelf from "../components/books/Shelf"
import { useShelfData } from "../hooks/useShelfData"
import { API } from "../api"

function getInitials(profile) {
  if (profile.full_name) {
    const parts = profile.full_name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase()
  }
  return profile.username?.charAt(0)?.toUpperCase() ?? "?"
}

function ProfilePage() {
  const { token, authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const [editingBio, setEditingBio] = useState(false)
  const [bioValue, setBioValue] = useState("")
  const [savingBio, setSavingBio] = useState(false)
  const bioRef = useRef(null)

  const { readingBooks, wantToReadBooks, finishedBooks } = useShelfData(token)

  useEffect(() => {
    if (!token) {
      setProfile(null)
      return
    }
    fetch(`${API}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile")
        return res.json()
      })
      .then((data) => {
        setProfile(data)
        setBioValue(data.bio ?? "")
      })
      .catch((err) => setError(err.message))
  }, [token])

  useEffect(() => {
    if (editingBio && bioRef.current) bioRef.current.focus()
  }, [editingBio])

  async function saveBio() {
    setSavingBio(true)
    try {
      const res = await fetch(`${API}/user/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: bioValue }),
      })
      if (!res.ok) throw new Error("Failed to save bio")
      const updated = await res.json()
      setProfile(updated)
      setBioValue(updated.bio ?? "")
    } finally {
      setSavingBio(false)
      setEditingBio(false)
    }
  }

  function handleBioKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      saveBio()
    }
    if (e.key === "Escape") {
      setBioValue(profile.bio ?? "")
      setEditingBio(false)
    }
  }

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </>
    )
  }

  if (!token) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-linear-to-br from-slate-950 to-blue-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-10 max-w-md w-full flex flex-col items-center text-center">
            <img src="/husky.svg" alt="HuskyReads" className="w-20 h-20 mb-5" />
            <h1 className="text-3xl font-bold text-blue-950 mb-3">Your reading profile awaits</h1>
            <p className="text-gray-600 text-sm mb-8">
              Track books, share reviews, and see what fellow UConn readers are enjoying.
            </p>
            <div className="flex gap-4 w-full">
              <Link
                to="/login"
                className="flex-1 bg-blue-950 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition font-medium text-center"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="flex-1 border-2 border-blue-950 text-blue-950 py-2 px-4 rounded-lg hover:bg-blue-50 transition font-medium text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!profile && !error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Profile Card */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col items-center mb-6">
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.username}
                      className="w-28 h-28 rounded-full object-cover shadow-md"
                    />
                  ) : (
                    <div
                      className="w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md select-none"
                      style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
                    >
                      {getInitials(profile)}
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-gray-900 mt-4">
                    {profile.username}
                  </h2>
                  {profile.full_name && (
                    <p className="text-gray-400 text-sm mt-0.5">{profile.full_name}</p>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span>
                      <span className="font-semibold text-gray-800">{finishedBooks.length}</span> read
                    </span>
                    <span className="text-gray-200">·</span>
                    <span>
                      <span className="font-semibold text-gray-800">{readingBooks.length}</span> reading
                    </span>
                    <span className="text-gray-200">·</span>
                    <span>
                      <span className="font-semibold text-gray-800">{wantToReadBooks.length}</span> want to read
                    </span>
                  </div>
                </div>

                {/* Bio section */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Bio</h3>
                    {!editingBio && (
                      <button
                        onClick={() => setEditingBio(true)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
                      >
                        {profile.bio ? "Edit" : "+ Add bio"}
                      </button>
                    )}
                  </div>

                  {editingBio ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        ref={bioRef}
                        value={bioValue}
                        onChange={(e) => setBioValue(e.target.value)}
                        onKeyDown={handleBioKeyDown}
                        rows={3}
                        placeholder="Tell people a bit about yourself…"
                        className="w-full text-sm text-gray-700 border border-indigo-300 rounded-lg px-3 py-2 resize-none outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setBioValue(profile.bio ?? ""); setEditingBio(false) }}
                          className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1 cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveBio}
                          disabled={savingBio}
                          className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {savingBio ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    profile.bio && (
                      <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Shelves */}
            <div className="lg:w-2/3">
              <Shelf title="Currently Reading" books={readingBooks} />
              <Shelf title="Want to Read" books={wantToReadBooks} />
              <Shelf title="Have Read" books={finishedBooks} />
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage
