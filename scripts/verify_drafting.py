"""Verification test for Evidence-Backed Legal Notice Drafting."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import json
from fastapi.testclient import TestClient
from src.api.server import app

def verify():
    client = TestClient(app)

    # 1. Verify Preview Clauses Endpoint
    res = client.get("/api/draft/clauses?query=service+level+penalties")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    preview_data = res.json()
    assert preview_data["status"] == "success"
    assert len(preview_data["clauses"]) > 0
    print(f"[PASS] Clause Preview: Successfully retrieved {len(preview_data['clauses'])} operative clauses prior to drafting.")

    # 2. Draft Notice API - Supported Breach with missing fields
    payload = {
        "doc_id": "DOC-008",
        "sender_entity": "Apex Biologics LLC",
        "recipient_entity": "Polaris Cold-Chain Solutions Inc",
        "recipient_address": "",  # Intentionally blank to test placeholder injection
        "alleged_breach": "Failure to maintain delivery window resulting in consignment spoilage exceeding four hours",
        "incident_date": "October 4, 2026",
        "notice_date": "October 9, 2026",
        "cure_period_days": "15",
        "demanded_remedy": "Immediate cargo loss indemnification and replacement delivery",
        "additional_facts": "Telemetry logged cargo temperature at 14.2°C during port detention.",
    }
    res = client.post("/api/draft/notice", json=payload)
    assert res.status_code == 200
    data = res.json()

    # Verify Safeguard 1: Mandatory lawyer-review disclaimer
    assert "*** DRAFT — REQUIRES LAWYER REVIEW ***" in data["draft_text"]
    assert data["lawyer_review_status"] == "DRAFT — REQUIRES LAWYER REVIEW"
    print("[PASS] Safeguard 1: Prominent 'DRAFT — REQUIRES LAWYER REVIEW' notice present.")

    # Verify Safeguard 2: Explicit placeholder for missing address
    assert "[RECIPIENT REGISTERED ADDRESS REQUIRED]" in data["draft_text"]
    assert "recipient_address" in data["missing_fields"]
    print("[PASS] Safeguard 2: Explicit placeholder [RECIPIENT REGISTERED ADDRESS REQUIRED] injected.")

    # Verify Safeguard 3: Grounded contractual clauses retrieved
    assert len(data["grounded_provisions"]) > 0
    prov = data["grounded_provisions"][0]
    assert "chunk_id" in prov
    assert "quote_snippet" in prov
    print(f"[PASS] Safeguard 3: {len(data['grounded_provisions'])} grounded clauses retrieved with chunk citations.")

    # Verify Safeguard 4: Attribution of allegations
    assert "According to factual assertions provided by Apex Biologics LLC" in data["draft_text"]
    assert "EVIDENTIARY DISTINCTION NOTICE" in data["draft_text"]
    print("[PASS] Safeguard 4: Client breach allegations segregated from verified contract terms.")

    # Verify Safeguard 5: Unsupported breach evidence gap detection
    unsupported_payload = {
        "doc_id": "DOC-008",
        "sender_entity": "CyberSec Systems LLC",
        "recipient_entity": "Host Corp",
        "alleged_breach": "Failure to remediate critical SQL injection vulnerability in web application database backend",
    }
    res_unsupported = client.post("/api/draft/notice", json=unsupported_payload)
    assert res_unsupported.status_code == 200
    unsup_data = res_unsupported.json()
    assert unsup_data["is_supported_by_contract"] is False
    assert "contractual_clause_grounding" in unsup_data["missing_fields"]
    assert "EVIDENCE GAP WARNING" in unsup_data["draft_text"]
    print("[PASS] Safeguard 5: Unsupported breach correctly identified with EVIDENCE GAP WARNING.")

    print("\nAll Evidence-Backed Legal Notice Drafting checks passed successfully!")

if __name__ == "__main__":
    verify()
