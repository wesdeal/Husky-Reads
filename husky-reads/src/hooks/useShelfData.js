import { useEffect, useState } from "react"
import { API } from "../api"

const BASE = API

async function fetchShelf(token, status) {
  const res = await fetch(`${BASE}/user/books?status=${status}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error(`Failed to fetch ${status} books`)
  return res.json()
}

export function useShelfData(token) {
  const [readingBooks, setReadingBooks] = useState([])
  const [wantToReadBooks, setWantToReadBooks] = useState([])
  const [finishedBooks, setFinishedBooks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setReadingBooks([])
      setWantToReadBooks([])
      setFinishedBooks([])
      return
    }

    setLoading(true)
    Promise.all([
      fetchShelf(token, "reading"),
      fetchShelf(token, "want_to_read"),
      fetchShelf(token, "finished"),
    ])
      .then(([reading, wantToRead, finished]) => {
        setReadingBooks(reading)
        setWantToReadBooks(wantToRead)
        setFinishedBooks(finished)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  return { readingBooks, wantToReadBooks, finishedBooks, loading }
}
