from __future__ import annotations
import logging
import time
from typing import List, Optional
import numpy as np
from src.core.models import Chunk, ScoredChunk

logger = logging.getLogger(__name__)


class DenseVectorEmbedder:
    """Computes genuine dense semantic embeddings.

    Supports:
    1. Remote: Gemini embedding model (default 'gemini-embedding-001', google-genai SDK) when
       api_key is configured. Chunks use task_type RETRIEVAL_DOCUMENT, queries RETRIEVAL_QUERY.
    2. Local: Latent Semantic Analysis (LSA: TF-IDF + TruncatedSVD) over corpus vocabulary,
       capturing semantic co-occurrence patterns in a continuous vector space without hashing.

    strict=True: API failures raise instead of degrading to LSA. With strict=False a failure
    switches the whole embedder to LSA (never mixes vector spaces between chunks and queries).
    """

    API_BATCH_SIZE = 100

    def __init__(
        self,
        dimension: int = 128,
        api_key: Optional[str] = None,
        model_name: str = "gemini-embedding-001",
        strict: bool = False,
        max_retries: int = 4,
    ):
        self.dimension = dimension
        self.api_key = api_key
        self.model_name = model_name
        self.strict = strict
        self.max_retries = max_retries
        self.use_api = bool(api_key and len(api_key) > 5)
        self._client = None
        self.api_dimension: Optional[int] = None

        self._lsa_fitted = False
        self._tfidf = None
        self._svd = None

    @property
    def active_backend(self) -> str:
        if self.use_api:
            return f"gemini:{self.model_name}"
        return "lsa" if self._lsa_fitted else "char_hash"

    def _api_embed(self, texts: List[str], task_type: str) -> np.ndarray:
        from google import genai
        from google.genai import types

        if self._client is None:
            self._client = genai.Client(api_key=self.api_key)

        vectors: List[np.ndarray] = []
        for i in range(0, len(texts), self.API_BATCH_SIZE):
            batch = texts[i:i + self.API_BATCH_SIZE]
            last_err: Optional[Exception] = None
            for attempt in range(self.max_retries):
                try:
                    resp = self._client.models.embed_content(
                        model=self.model_name,
                        contents=batch,
                        config=types.EmbedContentConfig(task_type=task_type),
                    )
                    break
                except Exception as e:
                    last_err = e
                    wait = 2 ** attempt * 2
                    logger.warning(f"Gemini embed_content failed (attempt {attempt + 1}/{self.max_retries}): {e}; retrying in {wait}s")
                    time.sleep(wait)
            else:
                raise RuntimeError(f"Gemini embed_content failed after {self.max_retries} attempts: {last_err}")
            vectors.extend(np.asarray(e.values, dtype=np.float32) for e in resp.embeddings)

        mat = np.vstack(vectors)
        self.api_dimension = int(mat.shape[1])
        norms = np.linalg.norm(mat, axis=1, keepdims=True)
        return mat / (norms + 1e-10)

    def _disable_api(self, err: Exception) -> None:
        if self.strict:
            raise err
        logger.warning(f"Gemini embeddings unavailable, switching embedder to local LSA: {err}")
        self.use_api = False

    def fit_local_semantic_space(self, corpus_texts: List[str]) -> None:
        """Fits Latent Semantic Analysis (LSA) space across the corpus text collection."""
        if not corpus_texts or self.use_api:
            return

        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.decomposition import TruncatedSVD

            min_df = 1
            self._tfidf = TfidfVectorizer(
                max_features=4000,
                ngram_range=(1, 2),
                sublinear_tf=True,
                token_pattern=r"(?u)\b\w[\w-]*\w\b|\b\w\b",
                stop_words="english",
            )
            tfidf_mat = self._tfidf.fit_transform(corpus_texts)

            n_samples, n_features = tfidf_mat.shape
            n_components = min(self.dimension, n_features - 1, n_samples - 1)
            if n_components < 2:
                n_components = min(self.dimension, n_features, n_samples)

            if n_components >= 2:
                self._svd = TruncatedSVD(n_components=n_components, random_state=42)
                self._svd.fit(tfidf_mat)
                self._lsa_fitted = True
            else:
                self._lsa_fitted = False
        except Exception as e:
            logger.warning(f"Failed to fit LSA semantic space: {e}")
            self._lsa_fitted = False

    def embed_text(self, text: str) -> np.ndarray:
        """Embeds single text (as a document) into continuous dense semantic space."""
        if self.use_api:
            try:
                return self._api_embed([text], "RETRIEVAL_DOCUMENT")[0]
            except Exception as e:
                self._disable_api(e)
        return self._embed_local(text)

    def embed_query(self, text: str) -> np.ndarray:
        """Embeds a search query (uses the query-side task type for the remote model)."""
        if self.use_api:
            try:
                return self._api_embed([text], "RETRIEVAL_QUERY")[0]
            except Exception as e:
                self._disable_api(e)
        return self._embed_local(text)

    def _embed_local(self, text: str) -> np.ndarray:
        # Local LSA Semantic Vector Representation
        if self._lsa_fitted and self._tfidf is not None and self._svd is not None:
            try:
                tfidf_vec = self._tfidf.transform([text])
                dense_vec = self._svd.transform(tfidf_vec)[0].astype(np.float32)
                norm = np.linalg.norm(dense_vec)
                if norm > 1e-10:
                    dense_vec = dense_vec / norm
                return dense_vec
            except Exception as e:
                logger.warning(f"LSA transform failed: {e}")

        # Fallback sparse-to-dense TF projection if LSA not yet fitted
        vec = np.zeros(self.dimension, dtype=np.float32)
        words = text.lower().split()
        if not words:
            return vec

        for w in words:
            # Deterministic character-based feature mapping without MD5
            h = sum(ord(c) * (31 ** i) for i, c in enumerate(w[:6])) % self.dimension
            vec[h] += 1.0

        norm = np.linalg.norm(vec)
        if norm > 1e-10:
            vec = vec / norm
        return vec

    def embed_batch(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dimension), dtype=np.float32)

        if self.use_api:
            try:
                return self._api_embed(texts, "RETRIEVAL_DOCUMENT")
            except Exception as e:
                self._disable_api(e)

        if not self._lsa_fitted:
            self.fit_local_semantic_space(texts)

        vectors = [self._embed_local(t) for t in texts]
        return np.vstack(vectors)


class DenseRetriever:
    """Dense vector retriever using cosine similarity over L2-normalized embeddings."""

    def __init__(self, embedder: Optional[DenseVectorEmbedder] = None):
        self.embedder = embedder or DenseVectorEmbedder()
        self.chunks: List[Chunk] = []
        self.chunk_embeddings: Optional[np.ndarray] = None
        self._indexed_backend: Optional[str] = None

    def index(self, chunks: List[Chunk]) -> None:
        self.chunks = list(chunks)
        if not chunks:
            self.chunk_embeddings = None
            return

        texts = [
            f"{' '.join(c.heading_path)} {c.section_heading} {c.text}"
            for c in chunks
        ]
        # Fit semantic space over all corpus chunks
        self.embedder.fit_local_semantic_space(texts)
        self.chunk_embeddings = self.embedder.embed_batch(texts)
        self._indexed_backend = self.embedder.active_backend

    def retrieve(self, query: str, top_k: int = 5) -> List[ScoredChunk]:
        if not self.chunks or self.chunk_embeddings is None:
            return []

        query_vec = self.embedder.embed_query(query)
        if self.embedder.active_backend != self._indexed_backend:
            # Embedder degraded after indexing (non-strict mode): rebuild index in the same space.
            self.index(self.chunks)
            query_vec = self.embedder.embed_query(query)
        q_norm = np.linalg.norm(query_vec)
        if q_norm < 1e-10:
            return []

        # Cosine similarity over normalized vectors
        scores = np.dot(self.chunk_embeddings, query_vec)

        k = min(top_k, len(self.chunks))
        top_indices = np.argsort(scores)[::-1][:k]

        results = []
        for rank, idx in enumerate(top_indices, start=1):
            results.append(
                ScoredChunk(
                    chunk=self.chunks[idx],
                    score=float(scores[idx]),
                    dense_score=float(scores[idx]),
                    lexical_score=None,
                    rank=rank,
                )
            )
        return results
