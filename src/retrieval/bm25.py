from __future__ import annotations
import math
import re
from collections import Counter
from typing import Dict, List, Tuple
from src.core.models import Chunk, ScoredChunk


class BM25Retriever:
    """Okapi BM25 implementation for lexical keyword retrieval over Chunk collections."""

    STOPWORDS = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
        "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
        "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
        "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
        "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me",
        "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only",
        "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she",
        "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
        "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until",
        "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
        "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
    }

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.chunks: List[Chunk] = []
        self.corpus_size: int = 0
        self.avg_doc_len: float = 0.0
        self.doc_lengths: List[int] = []
        self.doc_term_freqs: List[Counter] = []
        self.df: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}

    def tokenize(self, text: str) -> List[str]:
        # Lowercase, alphanumeric extraction preserving numbers and hyphens
        tokens = re.findall(r"[a-z0-9]+(?:[\-_][a-z0-9]+)*", text.lower())
        return [t for t in tokens if len(t) > 1 and t not in self.STOPWORDS]

    def index(self, chunks: List[Chunk]) -> None:
        self.chunks = list(chunks)
        self.corpus_size = len(chunks)
        if self.corpus_size == 0:
            return

        self.doc_lengths = []
        self.doc_term_freqs = []
        self.df = {}

        total_length = 0
        for chunk in chunks:
            # Combine heading path, section heading, and text for lexical indexing
            enriched_text = f"{' '.join(chunk.heading_path)} {chunk.section_heading} {chunk.text}"
            tokens = self.tokenize(enriched_text)
            doc_len = len(tokens)
            self.doc_lengths.append(doc_len)
            total_length += doc_len

            term_freq = Counter(tokens)
            self.doc_term_freqs.append(term_freq)

            for term in term_freq.keys():
                self.df[term] = self.df.get(term, 0) + 1

        self.avg_doc_len = total_length / self.corpus_size if self.corpus_size > 0 else 1.0

        # Calculate BM25 Robertson-Spärck Jones IDF
        self.idf = {}
        for term, freq in self.df.items():
            # Robertson-Spärck Jones IDF with smoothing
            val = (self.corpus_size - freq + 0.5) / (freq + 0.5) + 1.0
            self.idf[term] = math.log(max(val, 1e-6))

    def retrieve(self, query: str, top_k: int = 5) -> List[ScoredChunk]:
        if not self.chunks:
            return []

        query_tokens = self.tokenize(query)
        if not query_tokens:
            return []

        scores: List[float] = [0.0] * self.corpus_size

        for term in query_tokens:
            if term not in self.idf:
                continue
            term_idf = self.idf[term]

            for idx in range(self.corpus_size):
                tf = self.doc_term_freqs[idx].get(term, 0)
                if tf == 0:
                    continue
                doc_len = self.doc_lengths[idx]
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avg_doc_len))
                scores[idx] += term_idf * (numerator / denominator)

        # Pair scores with chunks and rank
        scored_pairs: List[Tuple[int, float]] = [(idx, scores[idx]) for idx in range(self.corpus_size)]
        scored_pairs.sort(key=lambda x: x[1], reverse=True)

        results: List[ScoredChunk] = []
        for rank, (idx, score) in enumerate(scored_pairs[:top_k], start=1):
            results.append(ScoredChunk(
                chunk=self.chunks[idx],
                score=float(score),
                lexical_score=float(score),
                rank=rank,
            ))

        return results
