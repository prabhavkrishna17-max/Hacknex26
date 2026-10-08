import unittest
from src.core.models import AnswerPayload, Chunk, Citation, ScoredChunk
from src.evaluation.metrics import EvaluationMetrics


class TestEvaluation(unittest.TestCase):

    def setUp(self):
        self.chunk = Chunk(
            chunk_id="DOC-001#c001",
            doc_id="DOC-001",
            document_title="Telemetry",
            section_heading="Limits",
            heading_path=["Limits"],
            text="The maximum allowed gRPC frame size is 4,194,304 bytes (4.0 MB). If exceeded, payloads are rejected with RESOURCE_EXHAUSTED.",
            char_start=0,
            char_end=140,
            token_count=20,
        )
        self.scored_chunk = ScoredChunk(chunk=self.chunk, score=0.9, rank=1)
        self.corpus_map = {"DOC-001#c001": self.chunk}

    def test_recall_at_k(self):
        recall = EvaluationMetrics.compute_recall_at_k([self.scored_chunk], ["DOC-001"])
        self.assertEqual(recall, 1.0)

        miss_recall = EvaluationMetrics.compute_recall_at_k([self.scored_chunk], ["DOC-002"])
        self.assertEqual(miss_recall, 0.0)

    def test_groundedness_and_fabricated_citations(self):
        # Case 1: Valid grounded citation
        valid_payload = AnswerPayload(
            query="test",
            answer_text="Payload size is 4.0 MB [DOC-001#c001].",
            citations=[Citation(
                claim="Payload size is 4.0 MB",
                chunk_id="DOC-001#c001",
                quote_snippet="4.0 MB",
                verified=True,
            )],
        )
        eval_res = EvaluationMetrics.evaluate_citations_and_groundedness(
            valid_payload, [self.scored_chunk], self.corpus_map
        )
        self.assertEqual(eval_res["groundedness"], 1.0)
        self.assertEqual(eval_res["fabricated_citation_count"], 0)
        self.assertEqual(eval_res["unsupported_claim_count"], 0)

        # Case 2: Fabricated citation pointing to non-existent chunk
        fake_payload = AnswerPayload(
            query="test",
            answer_text="Unicorns are active [DOC-999#c999].",
            citations=[Citation(
                claim="Unicorns are active",
                chunk_id="DOC-999#c999",
                verified=False,
            )],
        )
        fake_eval = EvaluationMetrics.evaluate_citations_and_groundedness(
            fake_payload, [self.scored_chunk], self.corpus_map
        )
        self.assertEqual(fake_eval["groundedness"], 0.0)
        self.assertEqual(fake_eval["fabricated_citation_count"], 1)
        self.assertEqual(fake_eval["unsupported_claim_count"], 1)


if __name__ == "__main__":
    unittest.main()
