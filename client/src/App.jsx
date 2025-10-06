import { useEffect, useState } from 'react';

export default function App() {
  const [status, setStatus] = useState('...');
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => setStatus(d.status));
    fetch('/api/books').then(r => r.json()).then(setBooks);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Husky Reads</h1>
      <p>Backend status: {status}</p>

      <h2>Books</h2>
      <ul>
        {books.map(b => (
          <li key={b.id}>
            {b.title} — {b.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
