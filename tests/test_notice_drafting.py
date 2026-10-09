import unittest
from fastapi.testclient import TestClient
from src.api.server import app, base_pipeline
from src.ingestion.parser import DocumentParser

UNSEEN_LOGISTICS_CONTRACT = """# Commercial Logistics and Cold-Chain Master Agreement

**Document ID:** UNSEEN-LOGISTICS-001
**Version:** 1.0
**Classification:** Confidential Commercial Contract
**Domain:** Supply Chain and Cold-Chain Logistics

## 2. Standard Service Levels and Delivery Window
2.1 For standard freight consignments, Service Provider shall effect delivery within forty-eight (48) hours of dispatch notification.
2.2 Subject to Section 2.3, Service Provider shall not be liable for delivery delays attributable to port customs clearance operations.

## 2.3 Expedited Medical Exception and Temperature Guarantee
2.3 Notwithstanding Section 2.2, for all consignments designated as Temperature Sensitive Goods, Service Provider warrants continuous active monitoring and shall remain strictly liable for consignment spoilage exceeding four (4) hours beyond the scheduled delivery window regardless of customs detention.

## 3. Invoicing and Payment Terms
3.1 Client shall remit undisputed invoice amounts within thirty (30) calendar days from receipt of a valid electronic invoice. Any amounts overdue by more than fifteen (15) days shall accrue interest at 1.25% per month.
"""


class TestNoticeDrafting(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Upload unseen test contract
        files = {
            "file": ("test_logistics_draft.md", UNSEEN_LOGISTICS_CONTRACT.encode("utf-8"), "text/markdown"),
        }
        res = cls.client.post("/api/upload", files=files, data={"jurisdiction": "United States"})
        assert res.status_code == 200


    def test_missing_information_placeholders(self):
        """Verify that absent sender/recipient/address/date fields produce explicit placeholders."""
        payload = {
            "doc_id": "UNSEEN-LOGISTICS-001",
            "alleged_breach": "Failure to deliver pharmaceuticals within 48 hours resulting in temperature excursion",
            # Leave optional fields blank to test safeguards
            "sender_entity": "",
            "recipient_entity": "",
            "recipient_address": "",
            "notice_date": "",
            "incident_date": "",
            "demanded_remedy": "",
        }
        res = self.client.post("/api/draft/notice", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        draft = data["draft_text"]
        self.assertIn("*** DRAFT — REQUIRES LAWYER REVIEW ***", draft)
        self.assertIn("[SENDER ENTITY / CLIENT NAME REQUIRED]", draft)
        self.assertIn("[RECIPIENT ENTITY / ADVERSE PARTY NAME REQUIRED]", draft)
        self.assertIn("[RECIPIENT REGISTERED ADDRESS REQUIRED]", draft)
        self.assertIn("[DATE OF FORMAL NOTICE REQUIRED]", draft)
        self.assertIn("[DATE(S) OF ALLEGED BREACH REQUIRED]", draft)
        self.assertIn("[DEMANDED REMEDY REQUIRED", draft)

        # Check missing fields list
        self.assertIn("recipient_address", data["missing_fields"])
        self.assertIn("sender_entity", data["missing_fields"])
        self.assertIn("demanded_remedy", data["missing_fields"])

    def test_grounded_contract_provisions_cited(self):
        """Verify that contractual obligations cite exact chunks from the selected document."""
        payload = {
            "doc_id": "UNSEEN-LOGISTICS-001",
            "sender_entity": "Apex Biologics LLC",
            "recipient_entity": "Polaris Cold-Chain Solutions Inc",
            "recipient_address": "100 Logistics Blvd, Anchorage, AK",
            "alleged_breach": "Failure to maintain delivery window resulting in consignment spoilage exceeding 4 hours",
            "incident_date": "October 4, 2026",
            "notice_date": "October 9, 2026",
            "demanded_remedy": "Immediate cure and indemnification for spoiled cargo value",
            "cure_period_days": "15",
        }
        res = self.client.post("/api/draft/notice", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        draft = data["draft_text"]
        # Must contain mandatory header
        self.assertIn("*** DRAFT — REQUIRES LAWYER REVIEW ***", draft)
        # Must mention parties
        self.assertIn("Apex Biologics LLC", draft)
        self.assertIn("Polaris Cold-Chain Solutions Inc", draft)
        # Must cite contract and chunk IDs
        self.assertIn("UNSEEN-LOGISTICS-001", draft)
        self.assertTrue(any(c["chunk_id"].startswith("UNSEEN-LOGISTICS-001") for c in data["grounded_provisions"]))
        # Must include the 15-day cure period
        self.assertIn("15 calendar days from receipt of this notice", draft)

    def test_allegation_attribution_not_established_fact(self):
        """Verify that user-supplied breach is attributed as an allegation rather than verified fact."""
        payload = {
            "doc_id": "UNSEEN-LOGISTICS-001",
            "sender_entity": "Acme Pharma",
            "recipient_entity": "Beta Trans",
            "alleged_breach": "Unilateral withholding of shipment tracking credentials",
            "additional_facts": "Customer service line was unresponsive for 3 days",
        }
        res = self.client.post("/api/draft/notice", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        draft = data["draft_text"]
        # Allegation must be explicitly attributed to the sender
        self.assertIn("According to factual assertions provided by Acme Pharma", draft)
        self.assertIn("EVIDENTIARY DISTINCTION NOTICE", draft)
        self.assertIn("assertions of Claimant and must be substantiated by admissible documentary", draft)
        self.assertIn("Additional factual context provided by Claimant:", draft)

    def test_unsupported_breach_evidence_gap(self):
        """Verify that when a breach has no supporting contract clauses, an evidence gap is identified and warned."""
        payload = {
            "doc_id": "UNSEEN-LOGISTICS-001",
            "sender_entity": "CyberSec Systems LLC",
            "recipient_entity": "Cloud Host Corp",
            "alleged_breach": "Failure to remediate critical SQL injection vulnerability in web application database",
        }
        res = self.client.post("/api/draft/notice", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertFalse(data["is_supported_by_contract"])
        self.assertIn("contractual_clause_grounding", data["missing_fields"])
        self.assertIsNotNone(data["missing_evidence"])
        self.assertIn("Missing evidence", data["support_notes"])
        self.assertIn("EVIDENCE GAP WARNING", data["draft_text"])


if __name__ == "__main__":
    unittest.main()
