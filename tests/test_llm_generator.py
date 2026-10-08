"""Offline checks of the Gemini generator's response handling.

The model client is stubbed; these tests exercise parsing and citation verification only
and never produce benchmark numbers.
"""
import json
import unittest
from types import SimpleNamespace
from src.core.models import Chunk, EvidenceState, ScoredChunk
from src.generation.llm_generator import GeminiLLMGenerator


class _StubModels:
    def __init__(self, text):
        self.text = text

    def generate_content(self, model, contents, config):
        return SimpleNamespace(text=self.text, candidates=[SimpleNamespace(finish_reason="STOP")])


def _generator_with_response(text, strict=True):
    gen = GeminiLLMGenerator(api_key="stub-key-for-tests", model_name="stub-model", strict=strict)
    gen._client = SimpleNamespace(models=_StubModels(text))
    return gen


class TestGeminiLLMGenerator(unittest.TestCase):

    def setUp(self):
        chunk = Chunk(
            chunk_id="DOC-004#c001",
            doc_id="DOC-004",
            document_title="Edge Security",
            section_heading="Transport Security",
            heading_path=["Security", "Transport Security"],
            text="Gateways mandate TLS 1.3 exclusively. Older protocols including HTTP/1.1 are actively rejected.",
            char_start=0,
            char_end=96,
            token_count=14,
        )
        self.chunks = [ScoredChunk(chunk=chunk, score=0.9, rank=1)]

    def test_verbatim_and_fabricated_citations(self):
        response = json.dumps({
            "evidence_state": "SUPPORTED",
            "verdict_summary": "Only TLS 1.3 is allowed.",
            "detailed_answer": "Gateways accept TLS 1.3 only.",
            "is_abstention": False,
            "abstention_reason": None,
            "claims": [
                {"claim_text": "TLS 1.3 only", "cited_chunk_id": "DOC-004#c001",
                 "verbatim_quote": "Gateways mandate TLS 1.3 exclusively."},
                {"claim_text": "Paraphrased", "cited_chunk_id": "DOC-004#c001",
                 "verbatim_quote": "TLS 1.3 is the only protocol."},
                {"claim_text": "Out of pool", "cited_chunk_id": "DOC-999#c000",
                 "verbatim_quote": "anything"},
            ],
        })
        payload = _generator_with_response(response).generate("Which TLS version?", self.chunks)

        self.assertEqual(payload.generated_by, "gemini:stub-model")
        self.assertEqual([c.verified for c in payload.citations], [True, False, False])
        self.assertEqual(payload.citations[0].char_start, 0)
        self.assertEqual(payload.citations[2].evidence_state, EvidenceState.INSUFFICIENT)

    def test_strict_mode_records_unparseable_output_without_fallback(self):
        payload = _generator_with_response("not json").generate("Which TLS version?", self.chunks)
        self.assertEqual(payload.generated_by, "gemini:stub-model:unparsed")
        self.assertEqual(payload.citations, [])

    def test_strict_mode_requires_api_key(self):
        gen = GeminiLLMGenerator(api_key="", strict=True)
        with self.assertRaises(RuntimeError):
            gen.generate("Which TLS version?", self.chunks)


if __name__ == "__main__":
    unittest.main()
