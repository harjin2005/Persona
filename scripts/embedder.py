import os
import requests
from supabase import create_client

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
sb = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

BATCH_SIZE = 20  # Gemini batch limit is 100, but 20 is safe


def embed_texts(texts: list[str]) -> list[list[float]]:
    embeddings = []
    for text in texts:
        resp = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={
                "model": "models/gemini-embedding-001",
                "content": {"parts": [{"text": text}]},
                "taskType": "RETRIEVAL_DOCUMENT",
                "outputDimensionality": 768,
            },
            timeout=15,
        )
        resp.raise_for_status()
        embeddings.append(resp.json()["embedding"]["values"])
    return embeddings


def embed_and_store(chunks: list[dict]) -> int:
    stored = 0
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        texts = [c["content"] for c in batch]
        embeddings = embed_texts(texts)
        rows = []
        for j, chunk in enumerate(batch):
            rows.append({
                "content": chunk["content"],
                "embedding": embeddings[j],
                "source": chunk["source"],
                "chunk_index": chunk["chunk_index"],
                "metadata": chunk.get("metadata", {}),
            })
        sb.table("documents").insert(rows).execute()
        stored += len(rows)
        print(f"  Stored {stored}/{len(chunks)} chunks...")
    return stored
