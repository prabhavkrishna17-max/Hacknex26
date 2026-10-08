import unittest
from src.core.models import Chunk, ScoredChunk
from src.interventions.jarf import JurisdictionAuthorityRouter
from src.interventions.cpde import ClausePrecedenceExpander
from src.interventions.esv import EvidenceSufficiencyVerifier


class TestInterventions(unittest.TestCase):

    def setUp(self):
        self.chunk_general = Chunk(
            chunk_id="DOC-006#c009",
            doc_id="DOC-006",
            document_title="Master Services Agreement",
            section_heading="8. Limitation of Liability and Consequential Damages",
            heading_path=["8. Limitation of Liability and Consequential Damages"],
            text="Subject to Section 8.3, each party's total aggregate liability shall be capped at 12 months fees.",
            char_start=0,
            char_end=100,
            token_count=18,
        )
        self.chunk_carveout = Chunk(
            chunk_id="DOC-006#c010",
            doc_id="DOC-006",
            document_title="Master Services Agreement",
            section_heading="8.3 Express Carveouts from Liability Caps",
            heading_path=["8. Limitation of Liability", "8.3 Express Carveouts"],
            text="The limitations in Section 8.1 and Section 8.2 shall not apply to breach of confidentiality or gross negligence.",
            char_start=101,
            char_end=220,
            token_count=21,
        )
        self.chunk_california = Chunk(
            chunk_id="DOC-009#c002",
            doc_id="DOC-009",
            document_title="Jurisdiction Schedules",
            section_heading="2. Schedule US-CAL: State of California",
            heading_path=["2. Schedule US-CAL: State of California"],
            text="Pursuant to California Business and Professions Code 16600, Section 10 is strictly void and unenforceable.",
            char_start=0,
            char_end=110,
            token_count=16,
        )
        self.chunk_delaware = Chunk(
            chunk_id="DOC-009#c003",
            doc_id="DOC-009",
            document_title="Jurisdiction Schedules",
            section_heading="3. Schedule US-DEL: State of Delaware",
            heading_path=["3. Schedule US-DEL: State of Delaware"],
            text="Section 10 is fully valid and enforceable under Delaware freedom of contract.",
            char_start=111,
            char_end=200,
            token_count=13,
        )

    def test_jarf_normalization_and_routing(self):
        jarf = JurisdictionAuthorityRouter(authority_boost=2.0)
        norm_cal = jarf.normalize_jurisdiction("California, USA")
        self.assertEqual(norm_cal, "US-CAL")

        norm_del = jarf.normalize_jurisdiction("State of Delaware")
        self.assertEqual(norm_del, "US-DEL")

        # Prioritize California schedule over Delaware schedule
        input_chunks = [
            ScoredChunk(chunk=self.chunk_delaware, score=0.8, rank=1),
            ScoredChunk(chunk=self.chunk_california, score=0.7, rank=2),
        ]
        reranked = jarf.filter_and_route(input_chunks, selected_jurisdiction="California", query="non-solicitation")
        self.assertEqual(reranked[0].chunk.chunk_id, "DOC-009#c002")  # California boosted to top

    def test_cpde_subject_to_expansion(self):
        cpde = ClausePrecedenceExpander(max_expansions=2)
        cpde.index_corpus([self.chunk_general, self.chunk_carveout])

        input_chunks = [
            ScoredChunk(chunk=self.chunk_general, score=0.9, rank=1)
        ]
        expanded, log = cpde.expand_dependencies(input_chunks, query="liability cap")
        self.assertEqual(len(expanded), 2)
        self.assertEqual(expanded[0].chunk.chunk_id, "DOC-006#c010")  # Carveout expanded and boosted
        self.assertEqual(len(log), 1)
        self.assertEqual(log[0]["referenced_section"], "8.3")

    def test_esv_insufficient_evidence_detection(self):
        esv = EvidenceSufficiencyVerifier()
        unanswerable_query = "What liquidated damages must Vendor pay for source code escrow failure?"
        retrieved = [ScoredChunk(chunk=self.chunk_general, score=0.4, rank=1)]

        v_res = esv.verify_sufficiency(unanswerable_query, retrieved)
        self.assertFalse(v_res["is_sufficient"])
        self.assertEqual(v_res["status"], "INSUFFICIENT")
        self.assertIn("source code escrow", v_res["missing_facets"])

        # Test calibrated abstention generation
        abstention = esv.generate_calibrated_abstention(unanswerable_query, v_res, retrieved)
        self.assertTrue(abstention.is_abstention)
        self.assertIn("do not contain sufficient evidence", abstention.answer_text)


if __name__ == "__main__":
    unittest.main()
