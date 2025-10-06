from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Book Rec API")

# optional in dev (proxy usually avoids CORS, but safe to include)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/books")
def list_books():
    return [
        {"id": 1, "title": "The Pragmatic Programmer", "author": "Hunt & Thomas"},
        {"id": 2, "title": "Clean Code", "author": "Robert C. Martin"},
    ]


@app.get("/api/health")
def health():
    return {"status": "ok"}
