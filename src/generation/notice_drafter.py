"""Evidence-backed Legal Notice Drafter.

Generates structured, lawyer-reviewable Legal Notices grounded in operative
contractual provisions while strictly segregating:
1. Source-grounded contract obligations (with verbatim chunk citations)
2. User-alleged breach facts (attributed as unverified sender assertions)
3. Explicit missing-information placeholders (e.g., [RECIPIENT ADDRESS REQUIRED])
4. Mandatory lawyer-review status (DRAFT — REQUIRES LAWYER REVIEW)
"""

from __future__ import annotations
import re
from typing import Any, Dict, List, Optional
from src.core.models import ScoredChunk


class LegalNoticeDrafter:
    """Produces structured legal notices grounded in verified contract evidence."""

    def draft_notice(
        self,
        doc_id: str,
        doc_title: str,
        retrieved_chunks: List[ScoredChunk],
        alleged_breach: str,
        selected_jurisdiction: str = "United States",
        sender_name: Optional[str] = None,
        sender_entity: Optional[str] = None,
        recipient_name: Optional[str] = None,
        recipient_entity: Optional[str] = None,
        recipient_address: Optional[str] = None,
        incident_date: Optional[str] = None,
        notice_date: Optional[str] = None,
        demanded_remedy: Optional[str] = None,
        cure_period_days: Optional[str] = None,
        additional_facts: Optional[str] = None,
    ) -> Dict[str, Any]:
        missing_fields: List[str] = []

        # 1. Resolve Parties & Metadata with explicit placeholders
        eff_sender = (sender_entity or sender_name or "").strip()
        if not eff_sender:
            eff_sender = "[SENDER ENTITY / CLIENT NAME REQUIRED]"
            missing_fields.append("sender_entity")

        eff_recipient = (recipient_entity or recipient_name or "").strip()
        if not eff_recipient:
            eff_recipient = "[RECIPIENT ENTITY / ADVERSE PARTY NAME REQUIRED]"
            missing_fields.append("recipient_entity")

        eff_address = (recipient_address or "").strip()
        if not eff_address:
            eff_address = "[RECIPIENT REGISTERED ADDRESS REQUIRED]"
            missing_fields.append("recipient_address")

        eff_notice_date = (notice_date or "").strip()
        if not eff_notice_date:
            eff_notice_date = "[DATE OF FORMAL NOTICE REQUIRED]"
            missing_fields.append("notice_date")

        eff_incident_date = (incident_date or "").strip()
        if not eff_incident_date:
            eff_incident_date = "[DATE(S) OF ALLEGED BREACH REQUIRED]"
            missing_fields.append("incident_date")

        eff_remedy = (demanded_remedy or "").strip()
        if not eff_remedy:
            eff_remedy = "[DEMANDED REMEDY REQUIRED — Specify monetary compensation, cure action, or contract termination]"
            missing_fields.append("demanded_remedy")

        # 2. Extract Grounded Contract Provisions from retrieved chunks
        grounded_provisions: List[Dict[str, Any]] = []
        clause_texts: List[str] = []
        contract_cure_hint: Optional[str] = None

        for sc in retrieved_chunks:
            chunk = sc.chunk
            if not chunk or not chunk.text.strip():
                continue

            sec_name = " > ".join(chunk.heading_path) if chunk.heading_path else (chunk.section_heading or "Operative Provision")
            
            # Check for contractual cure period or notice period mentions
            cure_match = re.search(r"(\b(?:thirty|sixty|fifteen|ten|fourteen|\d+)\s*\(\d+\)?\s*(?:calendar|business)?\s*days\b)", chunk.text, re.IGNORECASE)
            if cure_match and not contract_cure_hint:
                contract_cure_hint = f"{cure_match.group(1)} (pursuant to {sec_name})"

            # Extract first 2 operative sentences
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", chunk.text) if len(s.strip()) > 20 and not s.strip().startswith("##")]
            operative_excerpt = " ".join(sentences[:2]) if sentences else chunk.text[:220].strip()

            prov_item = {
                "chunk_id": chunk.chunk_id,
                "section": sec_name,
                "section_title": sec_name,
                "text": operative_excerpt,
                "quote_snippet": operative_excerpt,
                "cure_period_hint": contract_cure_hint,
                "full_text": chunk.text,
                "char_start": chunk.char_start,
                "char_end": chunk.char_end,
                "score": float(sc.score),
            }
            grounded_provisions.append(prov_item)
            clause_texts.append(f"• [{chunk.chunk_id}] {sec_name}:\n  \"{operative_excerpt}\"")

        # Substantive keyword overlap analysis between alleged breach and contract chunks
        stop_words = {
            "this", "that", "with", "from", "have", "been", "under", "which",
            "their", "there", "other", "about", "failure", "breach", "alleged",
            "claimant", "respondent", "party", "parties", "contract", "agreement",
            "within", "shall", "pursuant", "provide", "provided", "notice", "clause",
            "terms", "section", "during", "after", "before", "resulting", "related"
        }
        breach_tokens = [
            w for w in re.findall(r"\b[a-zA-Z]{4,}\b", alleged_breach.lower())
            if w not in stop_words
        ]

        all_clause_text = " ".join(c["full_text"].lower() for c in grounded_provisions)
        clause_tokens = set(re.findall(r"\b[a-zA-Z]{3,}\b", all_clause_text))
        has_substantive_match = False
        if breach_tokens:
            for token in breach_tokens:
                base_token = re.sub(r"(?:ing|ed|es|s)$", "", token)
                if token in clause_tokens or (len(base_token) >= 4 and any(base_token == re.sub(r"(?:ing|ed|es|s)$", "", ct) for ct in clause_tokens)):
                    has_substantive_match = True
                    break
        else:
            has_substantive_match = len(grounded_provisions) > 0

        is_supported_by_contract = len(grounded_provisions) > 0 and has_substantive_match
        missing_evidence: Optional[str] = None

        if not is_supported_by_contract:
            missing_fields.append("contractual_clause_grounding")
            missing_evidence = f"Operative clauses governing alleged breach ('{alleged_breach.strip()[:60]}...') not found in document '{doc_title}'."
            support_notes = (
                f"Document '{doc_title}' does not contain operative clauses supporting the alleged breach. "
                f"Missing evidence: Express contractual covenants, warranties, or service level agreements governing this specific claim."
            )
        else:
            support_notes = f"Grounded in {len(grounded_provisions)} operative clause(s) from {doc_title}."

        # 3. Resolve Cure Period / Response Deadline
        if cure_period_days and cure_period_days.strip():
            eff_cure = f"{cure_period_days.strip()} calendar days from receipt of this notice"
        elif contract_cure_hint:
            eff_cure = f"{contract_cure_hint} from receipt of this notice"
        else:
            eff_cure = "[RESPONSE / CURE DEADLINE REQUIRED — Specify timeline pursuant to agreement or governing law]"
            missing_fields.append("cure_period")

        # 4. Construct Draft Notice
        if is_supported_by_contract and clause_texts:
            clauses_formatted = "\n\n".join(clause_texts)
        else:
            clauses_formatted = (
                f"• [NO DIRECT CONTRACTUAL COVENANTS IDENTIFIED IN {doc_title} FOR THIS ALLEGED BREACH]\n"
                f"  EVIDENCE GAP AUDIT: Counsel must verify whether this claim arises under an unindexed schedule,\n"
                f"  separate statement of work, or extra-contractual statutory duty prior to service."
            )

        draft_lines = [
            "================================================================================",
            "*** DRAFT — REQUIRES LAWYER REVIEW ***",
            "CONFIDENTIAL LEGAL CORRESPONDENCE // PREPARED FOR COUNSEL EVALUATION",
            "================================================================================",
        ]

        if not is_supported_by_contract:
            draft_lines.extend([
                "",
                "*** EVIDENCE GAP WARNING ***",
                f"THE OPERATIVE PROVISIONS OF {doc_title} DO NOT CONTAIN DIRECT CONTRACTUAL COVENANTS",
                f"GOVERNING THE ALLEGED BREACH: \"{alleged_breach.strip()[:70]}...\".",
                "COUNSEL MUST INDEPENDENTLY VERIFY THE CONTRACTUAL BASIS BEFORE ISSUING FORMAL NOTICE.",
                "================================================================================",
            ])

        draft_lines.extend([
            "",
            f"DATE: {eff_notice_date}",
            "",
            f"VIA CERTIFIED MAIL / ELECTRONIC TRANSMISSION",
            f"TO: {eff_recipient}",
            f"ADDRESS: {eff_address}",
            "",
            f"FROM: {eff_sender}",
            f"GOVERNING JURISDICTION: {selected_jurisdiction}",
            f"REFERENCE CONTRACT: {doc_title} (Reference ID: {doc_id})",
            "",
            "SUBJECT: FORMAL NOTICE OF CONTRACTUAL BREACH AND DEMAND FOR CURE",
            "",
            "Dear Sir/Madam,",
            "",
            "This communication constitutes formal written notice on behalf of " + eff_sender + " (\"Claimant\") "
            "concerning material contractual non-compliance under the above-referenced agreement.",
            "",
            "--------------------------------------------------------------------------------",
            "1. RELEVANT CONTRACTUAL TERMS & OBLIGATIONS (SOURCE-GROUNDED)",
            "--------------------------------------------------------------------------------",
            "Under the operative terms of " + doc_title + ", the parties agreed to the following operative commitments:",
            "",
            clauses_formatted,
            "",
            "--------------------------------------------------------------------------------",
            "2. ALLEGED BREACH OF CONTRACT (USER-SUPPLIED ASSERTIONS)",
            "--------------------------------------------------------------------------------",
            f"According to factual assertions provided by {eff_sender}, the following non-compliance occurred on or about {eff_incident_date}:",
            "",
            f"  \"{alleged_breach.strip()}\"",
            "",
        ])

        if additional_facts and additional_facts.strip():
            draft_lines.extend([
                "Additional factual context provided by Claimant:",
                f"  \"{additional_facts.strip()}\"",
                "",
            ])

        draft_lines.extend([
            "EVIDENTIARY DISTINCTION NOTICE: The occurrence and severity of the aforementioned",
            "breach are assertions of Claimant and must be substantiated by admissible documentary",
            "records (e.g., invoices, transmission logs, delivery receipts, or outage tickets).",
            "",
            "--------------------------------------------------------------------------------",
            "3. DEMAND FOR REMEDY & CURE TIMELINE",
            "--------------------------------------------------------------------------------",
            "In accordance with the contractual framework and governing law, Claimant hereby formally demands:",
            "",
            f"  Remedy Demanded: {eff_remedy}",
            f"  Cure / Response Period: {eff_cure}",
            "",
            "Failure to cure the alleged breach or provide satisfactory written assurance within the specified",
            "timeline may result in Claimant exercising all available contractual and statutory remedies,",
            "including but not limited to formal dispute resolution, contract termination, or recovery of",
            "applicable damages pursuant to governing law.",
            "",
            "--------------------------------------------------------------------------------",
            "4. RESERVATION OF RIGHTS",
            "--------------------------------------------------------------------------------",
            "This notice is issued without waiver of, and strictly with reservation of, all rights, remedies,",
            "claims, defenses, and indemnities available to Claimant under the contract and applicable laws of",
            selected_jurisdiction + ".",
            "",
            "Sincerely,",
            "",
            "____________________________________________________",
            eff_sender,
            "[AUTHORIZED SIGNATURE / LEGAL COUNSEL OF RECORD]",
            "",
            "================================================================================",
            "*** MANDATORY COMPLIANCE NOTICE ***",
            "THIS DOCUMENT IS A PRELIMINARY COMPUTER-GENERATED DRAFT FOR LAWYER REVIEW ONLY.",
            "IT DOES NOT CONSTITUTE A COURT FILING, FORMAL LEGAL ADVICE, OR A BINDING INSTRUMENT.",
            "COUNSEL MUST INDEPENDENTLY CONFIRM ALL FACTS, VERIFY NOTICE ADDRESSES, AND REVIEW",
            "DISPUTE ESCALATION PREREQUISITES BEFORE ISSUANCE OR SERVICE.",
            "================================================================================",
        ])

        draft_text = "\n".join(draft_lines)

        user_assertions = [
            f"Allegation: {alleged_breach.strip()}",
            f"Incident Date: {eff_incident_date}",
        ]
        if additional_facts and additional_facts.strip():
            user_assertions.append(f"Additional Facts: {additional_facts.strip()}")

        return {
            "status": "success",
            "draft_text": draft_text,
            "missing_fields": missing_fields,
            "missing_evidence": missing_evidence,
            "grounded_provisions": grounded_provisions,
            "user_assertions": user_assertions,
            "doc_id": doc_id,
            "doc_title": doc_title,
            "is_supported_by_contract": is_supported_by_contract,
            "support_notes": support_notes,
            "cure_period": eff_cure,
            "lawyer_review_status": "DRAFT — REQUIRES LAWYER REVIEW",
        }
