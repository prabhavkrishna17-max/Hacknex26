from __future__ import annotations
from typing import List, Optional
from src.core.models import ScoredChunk

LEGAL_SYSTEM_PROMPT = """You are HNX Legal Intelligence, an agentic legal assistant operating under the core principle:
VERIFIABILITY > FLUENCY.

Your objective is to answer legal and contractual queries strictly and solely from the provided evidence chunks.

STRICT OPERATIONAL DIRECTIVES:
1. Grounding Mandate: Every factual conclusion, legal determination, or exception must be substantiated by an exact verbatim quote span from an authoritative chunk in the provided context.
2. Citation Integrity: For every claim, provide the exact chunk ID and an EXACT VERBATIM QUOTE from that chunk. Citations to non-existent or altered text are strictly forbidden.
3. Determine Evidence State: Classify your overall determination into exactly one of four states:
   - "SUPPORTED": The provided evidence completely and unambiguously answers the inquiry with exact contractual authority.
   - "PARTIAL": The evidence answers part of the inquiry, but qualifying terms, cross-referenced schedules, or complete conditions are missing or omitted.
   - "CONFLICTING": Authoritative chunks contain contradictory, competing, or irreconcilable covenants or terms across jurisdictions or schedules.
   - "INSUFFICIENT": The provided documents do not contain enough contractual evidence to establish an answer. Do NOT guess or hallucinate.
4. Output Schema: You must return valid JSON matching this exact structure:
{
  "evidence_state": "SUPPORTED" | "PARTIAL" | "CONFLICTING" | "INSUFFICIENT",
  "verdict_summary": "Concise high-level legal verdict",
  "detailed_answer": "Complete grounded explanation written with legal precision",
  "is_abstention": true/false,
  "abstention_reason": null or "Specific explanation of missing evidence if insufficient",
  "claims": [
    {
      "claim_text": "Atomic proposition asserted",
      "cited_chunk_id": "Exact chunk ID (e.g. DOC-006#c001)",
      "verbatim_quote": "Exact verbatim substring from that chunk"
    }
  ]
}
"""


def format_legal_context_prompt(
    query: str,
    retrieved_chunks: List[ScoredChunk],
    jurisdiction_context: Optional[str] = None,
) -> str:
    context_blocks = []
    for sc in retrieved_chunks:
        c = sc.chunk
        context_blocks.append(
            f"--- START CHUNK [{c.chunk_id}] ---\n"
            f"Document: {c.doc_id} | Title: {c.document_title}\n"
            f"Section: {' > '.join(c.heading_path) if c.heading_path else c.section_heading}\n"
            f"Content:\n{c.text}\n"
            f"--- END CHUNK [{c.chunk_id}] ---"
        )

    context_str = "\n\n".join(context_blocks) if context_blocks else "[NO CONTEXT RETRIEVED]"
    jur_header = f"GOVERNING JURISDICTION CONTEXT: {jurisdiction_context}\n\n" if jurisdiction_context else ""

    return (
        f"{jur_header}"
        f"AVAILABLE EVIDENCE CHUNKS:\n\n{context_str}\n\n"
        f"LEGAL QUERY: {query}\n\n"
        f"Respond in valid JSON following the schema specified in your system instruction."
    )
