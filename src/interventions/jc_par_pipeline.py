from __future__ import annotations
import time
from typing import Any, Dict, List, Optional, Tuple
from src.core.models import AnswerPayload, Chunk, ScoredChunk
from src.interventions.cpde import ClausePrecedenceExpander
from src.interventions.esv import EvidenceSufficiencyVerifier
from src.interventions.jarf import JurisdictionAuthorityRouter
from src.pipeline import BaselineRAGPipeline


class JCPARPipeline:
    """Jurisdiction-Conditioned Precedence-Aware RAG (JC-PAR) Pipeline.

    Orchestrates the three research interventions:
    - JARF (Jurisdiction Authority Router & Filter)
    - CPDE (Clause-Precedence Dependency Expander)
    - ESV  (Evidence Sufficiency Verifier)
    around the baseline RAG pipeline.
    """

    def __init__(
        self,
        base_pipeline: BaselineRAGPipeline,
        use_jarf: bool = False,
        use_cpde: bool = False,
        use_esv: bool = False,
        authority_boost: float = 2.5,
        max_expansions: int = 2,
    ):
        self.base_pipeline = base_pipeline
        self.use_jarf = use_jarf
        self.use_cpde = use_cpde
        self.use_esv = use_esv

        self.jarf = JurisdictionAuthorityRouter(authority_boost=authority_boost)
        self.cpde = ClausePrecedenceExpander(max_expansions=max_expansions)
        self.esv = EvidenceSufficiencyVerifier()

        # Build CPDE clause index if corpus is already loaded
        if self.base_pipeline.chunks:
            self.cpde.index_corpus(self.base_pipeline.chunks)

    def retrieve(
        self,
        query: str,
        selected_jurisdiction: Optional[str] = None,
        top_k: int = 4,
    ) -> Tuple[List[ScoredChunk], Dict[str, Any]]:
        """Executes retrieval with optional JARF and CPDE interventions."""
        meta: Dict[str, Any] = {"expansions": [], "jurisdiction_routed": False}

        # Step 1: Base hybrid retrieval
        fetch_k = top_k + 2 if (self.use_jarf or self.use_cpde) else top_k
        candidates = self.base_pipeline.retrieve(query, top_k=fetch_k)

        # Step 2: JARF intervention (if enabled)
        if self.use_jarf and selected_jurisdiction:
            candidates = self.jarf.filter_and_route(candidates, selected_jurisdiction, query)
            meta["jurisdiction_routed"] = True

        # Step 3: CPDE intervention (if enabled)
        if self.use_cpde:
            candidates, exp_log = self.cpde.expand_dependencies(candidates, query)
            meta["expansions"] = exp_log

        # Trim back to requested top_k (preserving top boosted/expanded items)
        final_chunks = candidates[:top_k]
        return final_chunks, meta

    def query(
        self,
        query: str,
        selected_jurisdiction: Optional[str] = None,
        question_id: Optional[str] = None,
        top_k: int = 4,
    ) -> AnswerPayload:
        """Executes end-to-end question answering with all active interventions."""
        t0 = time.perf_counter()
        trace_log: List[str] = []

        # 1. Retrieval
        trace_log.append(f"Retrieving top {top_k} candidates for query.")
        retrieved_chunks, ret_meta = self.retrieve(query, selected_jurisdiction=selected_jurisdiction, top_k=top_k)
        ret_ms = (time.perf_counter() - t0) * 1000.0

        if ret_meta.get("jurisdiction_routed"):
            trace_log.append(f"JARF applied authority boost/filter for {selected_jurisdiction}.")
        if ret_meta.get("expansions"):
            trace_log.append(f"CPDE expanded {len(ret_meta['expansions'])} precedence dependencies.")

        # 2. ESV Sufficiency Verification (if enabled)
        if self.use_esv:
            v_res = self.esv.verify_sufficiency(query, retrieved_chunks, selected_jurisdiction=selected_jurisdiction)
            trace_log.append(f"ESV verification status: {v_res.get('status')}")
            if not v_res["is_sufficient"] and v_res["status"] in ("INSUFFICIENT", "NO_RELEVANT_EVIDENCE"):
                abstain_payload = self.esv.generate_calibrated_abstention(
                    query=query,
                    verification_result=v_res,
                    retrieved_chunks=retrieved_chunks,
                    question_id=question_id,
                )
                tot_ms = (time.perf_counter() - t0) * 1000.0
                abstain_payload.latency_ms = {"retrieval_ms": ret_ms, "generation_ms": 0.0, "total_ms": tot_ms}
                abstain_payload.jurisdiction_context = selected_jurisdiction
                abstain_payload.trace_log = trace_log
                return abstain_payload

        # 3. Grounded Generation
        augmented_query = query
        if self.use_jarf and selected_jurisdiction:
            augmented_query = f"{query} [Jurisdiction: {selected_jurisdiction}]"

        t_gen = time.perf_counter()
        answer = self.base_pipeline.generate(
            augmented_query,
            retrieved_chunks,
            question_id=question_id,
            jurisdiction_context=selected_jurisdiction,
        )
        gen_ms = (time.perf_counter() - t_gen) * 1000.0
        tot_ms = (time.perf_counter() - t0) * 1000.0

        answer.latency_ms = {"retrieval_ms": ret_ms, "generation_ms": gen_ms, "total_ms": tot_ms}
        answer.jurisdiction_context = selected_jurisdiction
        answer.trace_log = trace_log
        return answer
