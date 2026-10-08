import unittest
from src.core.models import Chunk, ScoredChunk
from src.generation.deterministic import DeterministicBaselineGenerator
from src.interventions.jarf import JurisdictionAuthorityRouter
from src.interventions.cpde import ClausePrecedenceExpander
from src.interventions.esv import EvidenceSufficiencyVerifier
from src.retrieval.dense import DenseRetriever, DenseVectorEmbedder


class TestRealGeneralization(unittest.TestCase):
    """Rigorous generalization test on a completely novel, unseen commercial agreement."""

    def setUp(self):
        # A completely novel agreement (Master Equipment Lease & Maintenance Agreement)
        self.chunk_rent = Chunk(
            chunk_id="LEASE-001#c001",
            doc_id="LEASE-001",
            document_title="Master Equipment Lease",
            section_heading="3. Monthly Rental and Invoicing",
            heading_path=["Master Equipment Lease", "3. Monthly Rental"],
            text="Lessee shall remit monthly lease fees of $15,000 USD net thirty (30) days from invoice date. Late payments incur interest at 1.5% per month.",
            char_start=0,
            char_end=150,
            token_count=26,
        )

        self.chunk_maintenance = Chunk(
            chunk_id="LEASE-001#c002",
            doc_id="LEASE-001",
            document_title="Master Equipment Lease",
            section_heading="4. Routine Maintenance and Emergency Repairs",
            heading_path=["Master Equipment Lease", "4. Routine Maintenance"],
            text="Subject to Section 4.2, Lessor shall provide routine maintenance during normal business hours (9 AM to 5 PM EST).",
            char_start=151,
            char_end=270,
            token_count=21,
        )

        self.chunk_emergency = Chunk(
            chunk_id="LEASE-001#c003",
            doc_id="LEASE-001",
            document_title="Master Equipment Lease",
            section_heading="4.2 Emergency Server Outage Response",
            heading_path=["Master Equipment Lease", "4. Maintenance", "4.2 Emergency Response"],
            text="Notwithstanding Section 4, Lessor warrants a four (4) hour on-site dispatch time for catastrophic hardware failures occurring outside business hours.",
            char_start=271,
            char_end=420,
            token_count=23,
        )

        self.chunk_texas_addendum = Chunk(
            chunk_id="LEASE-ADD-TX#c001",
            doc_id="LEASE-ADD-TX",
            document_title="Texas State Addendum",
            section_heading="Schedule US-TX: State of Texas Modifications",
            heading_path=["Texas State Addendum", "Schedule US-TX"],
            text="Pursuant to Texas Business and Commerce Code, late payment interest under Section 3 shall not exceed 1.0% per month.",
            char_start=0,
            char_end=120,
            token_count=18,
        )

        self.chunks = [self.chunk_rent, self.chunk_maintenance, self.chunk_emergency, self.chunk_texas_addendum]
        self.generator = DeterministicBaselineGenerator()

    def test_verbatim_fact_extraction_and_citation_span(self):
        """Tests that answer extracts exact text with accurate character offsets on unseen text."""
        scored = [ScoredChunk(chunk=self.chunk_rent, score=0.92, rank=1)]
        query = "What is the monthly rental fee and what is the payment term?"
        payload = self.generator.generate(query, scored)

        self.assertFalse(payload.is_abstention)
        self.assertIn("15,000", payload.answer_text)
        self.assertEqual(len(payload.citations), 1)

        cit = payload.citations[0]
        self.assertEqual(cit.chunk_id, "LEASE-001#c001")
        self.assertIsNotNone(cit.char_start)
        self.assertIsNotNone(cit.char_end)

        # Verify character span matches chunk text exactly
        extracted_span = self.chunk_rent.text[cit.char_start:cit.char_end]
        self.assertEqual(extracted_span, cit.quote_snippet)
        self.assertIn("15,000", extracted_span)

    def test_calibrated_abstention_on_unseen_missing_topic(self):
        """Verifies genuine abstention on an unseen legal topic (hazardous materials)."""
        scored = [ScoredChunk(chunk=self.chunk_rent, score=0.35, rank=1)]
        esv = EvidenceSufficiencyVerifier()
        query = "What protocol governs hazardous chemical disposal from the leased machinery?"

        v_res = esv.verify_sufficiency(query, scored)
        self.assertFalse(v_res["is_sufficient"])
        self.assertEqual(v_res["status"], "INSUFFICIENT")

        abstention = esv.generate_calibrated_abstention(query, v_res, scored)
        self.assertTrue(abstention.is_abstention)
        self.assertIn("do not contain sufficient evidence", abstention.answer_text)
        self.assertEqual(len(abstention.citations), 0)

    def test_dynamic_precedence_expansion_without_doc_hardcoding(self):
        """Verifies CPDE finds Section 4.2 emergency carveout across novel documents."""
        cpde = ClausePrecedenceExpander(max_expansions=2)
        cpde.index_corpus(self.chunks)

        input_chunks = [ScoredChunk(chunk=self.chunk_maintenance, score=0.88, rank=1)]
        expanded, log = cpde.expand_dependencies(input_chunks, query="maintenance response hours")

        self.assertEqual(len(expanded), 2)
        # Emergency section was dynamically located and expanded
        expanded_ids = [sc.chunk.chunk_id for sc in expanded]
        self.assertIn("LEASE-001#c003", expanded_ids)
        self.assertEqual(log[0]["referenced_section"], "4.2")

    def test_dynamic_jurisdiction_routing_without_doc_hardcoding(self):
        """Verifies JARF prioritizes Texas addendum when Texas jurisdiction is requested."""
        jarf = JurisdictionAuthorityRouter(authority_boost=2.0)
        norm_tx = jarf.normalize_jurisdiction("Texas")
        self.assertEqual(norm_tx, "US-TX")

        input_chunks = [
            ScoredChunk(chunk=self.chunk_rent, score=0.85, rank=1),
            ScoredChunk(chunk=self.chunk_texas_addendum, score=0.75, rank=2),
        ]
        reranked = jarf.filter_and_route(input_chunks, selected_jurisdiction="Texas", query="late payment interest rate")
        # Texas addendum chunk should be boosted
        self.assertEqual(reranked[0].chunk.chunk_id, "LEASE-ADD-TX#c001")


if __name__ == "__main__":
    unittest.main()
