import base64
import time
import requests

GITHUB_REPOS = [
    "harjin2005/AI-Tutor-Orchestrator",
    "harjin2005/Guard-Objective-Automation",
    "harjin2005/automated_fallout",
    "harjin2005/AI-Engineer-Projects",
    "harjin2005/ai-chatbot",
    "harjin2005/ai_projects",
    "harjin2005/CI-CD-HEALING-AGENT",
    "harjin2005/AI-Market-analyser-VAIA",
    "harjin2005/AI_Doctor_receptionist",
    "harjin2005/Emergent_Ci_CD",
]

HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "harjinder-ai-persona-ingestion",
}


def fetch_readme(repo: str) -> str:
    url = f"https://api.github.com/repos/{repo}/readme"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    if resp.status_code != 200:
        return ""
    content = resp.json().get("content", "")
    return base64.b64decode(content).decode("utf-8", errors="ignore")


def fetch_repo_meta(repo: str) -> dict:
    url = f"https://api.github.com/repos/{repo}"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    if resp.status_code != 200:
        return {}
    data = resp.json()
    return {
        "name": data.get("name", ""),
        "description": data.get("description", ""),
        "language": data.get("language", ""),
        "topics": data.get("topics", []),
        "stars": data.get("stargazers_count", 0),
    }


def get_github_chunks() -> list[dict]:
    from chunker import chunk_text
    all_chunks = []
    for repo in GITHUB_REPOS:
        print(f"  Crawling {repo}...")
        meta = fetch_repo_meta(repo)
        readme = fetch_readme(repo)
        repo_name = repo.split("/")[1]

        text = f"""GitHub Repository: {repo_name}
Description: {meta.get('description', 'No description')}
Primary Language: {meta.get('language', 'Unknown')}
Topics: {', '.join(meta.get('topics', []))}

README:
{readme[:8000]}""".strip()

        chunks = chunk_text(text, source=f"github:{repo_name}")
        for c in chunks:
            c["metadata"]["repo"] = repo_name
            c["metadata"]["description"] = meta.get("description", "")
        all_chunks.extend(chunks)
        time.sleep(0.5)
    return all_chunks
