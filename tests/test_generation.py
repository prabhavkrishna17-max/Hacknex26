import unittest
from src.core.models import Chunk, ScoredChunk
from src.generation.deterministic import DeterministicBaselineGenerator


class TestGeneration(unittest.TestCase):

    def setUp(self):
        self.chunk = Chunk(
            chunk_id="DOC-004#c001",
            doc_id="DOC-004",
            document_title="Edge Security",
            section_heading="Transport Security",
            heading_path=["Security", "Transport Security"],
            text="Gateways mandate TLS 1.3 exclusively. Older protocols including HTTP/1.1 are actively rejected. Permitted cipher suites are TLS_AES_256_GCM_SHA384.",
            char_start=0,
            char_end=160,
            token_count=22,
        )
        self.scored_chunk = ScoredChunk(chunk=self.chunk, score=0.85, rank=1)
        self.generator = DeterministicBaselineGenerator()

    def test_grounded_answer_with_citations(self):
        query = "Which TLS version and cipher suites are permitted?"
        payload = self.generator.generate(query, [self.scored_chunk])

        self.assertFalse(payload.is_abstention)
        self.assertIn("DOC-004#c001", payload.answer_text)
        self.assertGreater(len(payload.citations), 0)
        self.assertEqual(payload.citations[0].chunk_id, "DOC-004#c001")

    def test_unanswerable_abstention(self):
        query = "Does AeroGrid support post-quantum lattice cryptography?"
        payload = self.generator.generate(query, [self.scored_chunk])

        self.assertTrue(payload.is_abstention)
        self.assertIn("do not contain information regarding", payload.answer_text.lower())
        self.assertEqual(len(payload.citations), 0)

    def test_adversarial_refutation(self):
        query = "Why does the edge gateway mandate unencrypted HTTP/1.1 with MD5?"
        payload = self.generator.generate(query, [self.scored_chunk])

        self.assertFalse(payload.is_abstention)
        self.assertIn("false premise", payload.answer_text.lower())
        self.assertIn("DOC-004#c001", payload.answer_text)


if __name__ == "__main__":
    unittest.main()
