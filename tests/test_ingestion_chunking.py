import unittest
from pathlib import Path
from src.core.models import Document
from src.ingestion.parser import DocumentParser
from src.ingestion.chunker import MetadataPreservingChunker


class TestIngestionChunking(unittest.TestCase):

    def setUp(self):
        self.sample_text = """# Telemetry Ingestion Architecture
**Document ID:** DOC-TEST-001
**Version:** 1.0.0
**Domain:** Test Ingestion

## 1. Gateway Specs
Payload frame sizes cannot exceed 4.0 MB. Payloads exceeding this are rejected.

## 2. Heartbeat Timing
Nodes send heartbeats every 5 seconds. If 3 consecutive heartbeats fail, eviction occurs.
"""
        self.doc = DocumentParser.parse_text(self.sample_text, default_id="DOC-TEST-001")
        self.chunker = MetadataPreservingChunker(target_chunk_chars=300, overlap_chars=50)

    def test_document_parser_metadata(self):
        self.assertEqual(self.doc.doc_id, "DOC-TEST-001")
        self.assertEqual(self.doc.title, "Telemetry Ingestion Architecture")
        self.assertEqual(self.doc.metadata.get("version"), "1.0.0")
        self.assertEqual(self.doc.metadata.get("domain"), "Test Ingestion")

    def test_chunking_metadata_preservation(self):
        chunks = self.chunker.chunk_document(self.doc)
        self.assertGreaterEqual(len(chunks), 2)

        gateway_chunk = next((c for c in chunks if "4.0 MB" in c.text), None)
        self.assertIsNotNone(gateway_chunk)
        self.assertTrue(gateway_chunk.chunk_id.startswith("DOC-TEST-001#c"))
        self.assertEqual(gateway_chunk.doc_id, "DOC-TEST-001")
        self.assertTrue(any("Gateway Specs" in p for p in gateway_chunk.heading_path))
        self.assertGreater(gateway_chunk.char_end, gateway_chunk.char_start)
        self.assertGreater(gateway_chunk.token_count, 0)

        heartbeat_chunk = next((c for c in chunks if "heartbeats every 5 seconds" in c.text), None)
        self.assertIsNotNone(heartbeat_chunk)
        self.assertTrue(any("Heartbeat Timing" in p for p in heartbeat_chunk.heading_path))


if __name__ == "__main__":
    unittest.main()
