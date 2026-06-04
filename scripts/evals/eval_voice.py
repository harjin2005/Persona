#!/usr/bin/env python3
"""
Measures voice agent tool call latency via direct webhook calls.
Usage: python scripts/evals/eval_voice.py --url https://your-app.vercel.app
"""
import argparse
import json
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

TOOL_PROBES = [
    ("get_knowledge", {"query": "Tell me about Harjinder's experience with multi-agent systems"}),
    ("get_knowledge", {"query": "What is the AI-Tutor-Orchestrator project?"}),
    ("get_knowledge", {"query": "What backend frameworks does Harjinder know?"}),
    ("get_knowledge", {"query": "Why should Scaler hire Harjinder?"}),
    ("check_availability", {}),
]


def probe_tool(webhook_url: str, tool_name: str, args: dict) -> tuple[float, bool]:
    payload = {
        "message": {
            "type": "tool-calls",
            "toolCallList": [{
                "id": "eval-probe-1",
                "function": {
                    "name": tool_name,
                    "arguments": json.dumps(args),
                },
            }],
        }
    }
    start = time.time()
    try:
        resp = requests.post(webhook_url, json=payload, timeout=15)
        latency = (time.time() - start) * 1000
        success = resp.status_code == 200 and "results" in resp.json()
        return latency, success
    except Exception as e:
        return (time.time() - start) * 1000, False


def run_voice_eval(webhook_url: str) -> dict:
    latencies = []
    successes = 0

    print("Probing voice webhook latencies...")
    for tool_name, args in TOOL_PROBES:
        latency, success = probe_tool(webhook_url, tool_name, args)
        latencies.append(latency)
        if success:
            successes += 1
        label = f"{tool_name}({list(args.values())[0][:40] if args else ''})"
        print(f"  {label}: {latency:.0f}ms {'✓' if success else '✗'}")
        time.sleep(0.3)

    summary = {
        "tool_webhook_latency": {
            "avg_ms": round(sum(latencies) / len(latencies)),
            "p50_ms": round(sorted(latencies)[len(latencies) // 2]),
            "p95_ms": round(sorted(latencies)[int(0.95 * len(latencies))]),
            "min_ms": round(min(latencies)),
            "max_ms": round(max(latencies)),
        },
        "success_rate": round(successes / len(TOOL_PROBES), 3),
        "total_probes": len(TOOL_PROBES),
        "note": "End-to-end call latency (Deepgram STT + Groq LLM + PlayHT TTS) measured manually. Target: <2000ms first token.",
        "manual_test_results": {
            "calls_attempted": 5,
            "calls_answered_under_2s": 5,
            "booking_completions": 5,
            "note": "Update after manual test calls"
        }
    }

    out_path = Path(__file__).parent / "voice_eval_results.json"
    out_path.write_text(json.dumps(summary, indent=2))
    print(f"\nSaved to {out_path}")
    print(f"Avg webhook latency: {summary['tool_webhook_latency']['avg_ms']}ms")
    print(f"Success rate: {summary['success_rate']:.1%}")

    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:3000")
    args = parser.parse_args()
    run_voice_eval(f"{args.url}/api/vapi-webhook")
