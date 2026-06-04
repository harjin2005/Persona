import tiktoken

CHUNK_SIZE = 400
CHUNK_OVERLAP = 80

enc = tiktoken.get_encoding("cl100k_base")


def chunk_text(text: str, source: str) -> list[dict]:
    tokens = enc.encode(text)
    chunks = []
    start = 0
    idx = 0
    while start < len(tokens):
        end = min(start + CHUNK_SIZE, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_content = enc.decode(chunk_tokens).strip()
        if len(chunk_content) > 50:
            chunks.append({
                "content": chunk_content,
                "source": source,
                "chunk_index": idx,
                "metadata": {"char_count": len(chunk_content)},
            })
            idx += 1
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks
