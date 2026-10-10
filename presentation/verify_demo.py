"""Verifies the pitch-deck demo questions against the live HNX backend.

Uploads data/demo/demo_contract.md (UNSEEN-LOGISTICS-001) to the running API (in-memory index
only) and records the actual /api/ask responses to assets/demo_verification.json.
Usage: python verify_demo.py   (backend must be running on http://127.0.0.1:8000)
"""
import json
import time
import urllib.request
import uuid
from pathlib import Path

API = "http://127.0.0.1:8000"
ROOT = Path(__file__).resolve().parent
CONTRACT = ROOT.parent / "data" / "demo" / "demo_contract.md"
DOC_ID = "UNSEEN-LOGISTICS-001"

QUESTIONS = [
    "What is the standard delivery window for freight consignments?",
    "What are the invoice payment terms and when does overdue interest apply?",
    "Is the service provider liable for spoilage of temperature sensitive goods when customs detention delays delivery?",
    "What are the aircraft hangar maintenance guidelines and hazardous chemical disposal protocols?",
]


def post_json(path, payload):
    req = urllib.request.Request(
        API + path, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read())


def upload(path):
    boundary = uuid.uuid4().hex
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"jurisdiction\"\r\n\r\nUnited States\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{path.name}\"\r\n"
        f"Content-Type: text/markdown\r\n\r\n"
    ).encode() + path.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        API + "/api/upload", data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read())


def main():
    record = {"timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"), "upload": upload(CONTRACT), "answers": []}
    for q in QUESTIONS:
        t0 = time.time()
        res = post_json("/api/ask", {"query": q, "doc_id": DOC_ID, "jurisdiction": "United States"})
        record["answers"].append(
            {
                "question": q,
                "seconds": round(time.time() - t0, 1),
                "evidence_state": res.get("evidence_state"),
                "is_abstention": res.get("is_abstention"),
                "generated_by": res.get("generated_by"),
                "answer_text": res.get("answer_text"),
                "abstention_reason": res.get("abstention_reason"),
                "citations": [
                    {k: c.get(k) for k in ("chunk_id", "quote_snippet", "verified", "verification_reason")}
                    for c in res.get("citations", [])
                ],
                "evidence_docs": sorted({e.get("doc_id") for e in res.get("evidence", [])}),
                "relationships": [
                    {k: r.get(k) for k in ("source_section", "referenced_section", "relation", "direction")}
                    for r in res.get("relationships", [])
                ],
            }
        )
    out = ROOT / "assets" / "demo_verification.json"
    out.write_text(json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(record, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
