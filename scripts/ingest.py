#!/usr/bin/env python3
"""
Run from project root: python scripts/ingest.py
Crawls GitHub repos + parses resume -> chunks -> embeds -> stores in Supabase pgvector.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

root = Path(__file__).parent.parent
load_dotenv(root / ".env.local")

sys.path.insert(0, str(Path(__file__).parent))

from resume_parser import get_resume_chunks
from github_crawler import get_github_chunks
from embedder import embed_and_store


def main():
    print("=== Harjinder AI Persona — RAG Ingestion ===\n")

    print("Step 1: Parsing resume...")
    resume_chunks = get_resume_chunks()
    print(f"  {len(resume_chunks)} resume chunks\n")

    print("Step 2: Crawling GitHub repos...")
    github_chunks = get_github_chunks()
    print(f"  {len(github_chunks)} GitHub chunks\n")

    all_chunks = resume_chunks + github_chunks
    print(f"Step 3: Embedding + storing {len(all_chunks)} total chunks...")
    stored = embed_and_store(all_chunks)

    print(f"\nDone. {stored} chunks stored in Supabase pgvector.")


if __name__ == "__main__":
    main()
