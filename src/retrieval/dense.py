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
        api_keys: Optional[List[str]] = None,
        model_name: str = "gemini-embedding-001",
        strict: bool = False,
        max_retries: int = 2,
    ):
        self.dimension = dimension
        self.api_keys = [k for k in (api_keys or ([api_key] if api_key else [])) if k and len(k) > 5]
        self._key_index = 0
        self.api_key = self.api_keys[0] if self.api_keys else (api_key or "")
        self.model_name = model_name
        self.strict = strict
        self.max_retries = max_retries
        self.use_api = bool(self.api_key and len(self.api_key) > 5)
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

        vectors: List[np.ndarray] = []
        for i in range(0, len(texts), self.API_BATCH_SIZE):
            batch = texts[i:i + self.API_BATCH_SIZE]
            batch_success = False

            while not batch_success and self.use_api:
                if self._client is None:
                    self._client = genai.Client(api_key=self.api_key)

                try:
                    resp = self._client.models.embed_content(
                        model=self.model_name,
                        contents=batch,
                        config=types.EmbedContentConfig(task_type=task_type),
                    )
                    vectors.extend(np.asarray(e.values, dtype=np.float32) for e in resp.embeddings)
                    batch_success = True
                except Exception as e:
                    err_str = str(e)
                    is_quota = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "Quota exceeded" in err_str
                    is_auth = "401" in err_str or "403" in err_str or "API_KEY_INVALID" in err_str or "invalid" in err_str.lower()

                    if is_quota or is_auth:
                        logger.warning(
                            f"Gemini embedding key (index {self._key_index}) failed with {'quota exhaustion (429)' if is_quota else 'auth error'}. Checking alternate configured keys."
                        )
                        # Try next configured key without long sleeping
                        if self._key_index + 1 < len(self.api_keys):
                            self._key_index += 1
                            self.api_key = self.api_keys[self._key_index]
                            self._client = None
                            logger.info(f"Switched to alternate configured Gemini key index {self._key_index}")
                            continue
                        else:
                            # All keys exhausted or no alternate keys
                            self._disable_api(e)
                            break
                    else:
                        # Transient or unknown error: do not sleep indefinitely
                        logger.warning(f"Gemini embed_content error: {type(e).__name__}; disabling API to preserve responsiveness.")
                        self._disable_api(e)
                        break

            if not batch_success:
                raise RuntimeError("Remote embedding failed or quota exhausted; fallback to local LSA.")

        mat = np.vstack(vectors)
        self.api_dimension = int(mat.shape[1])
        norms = np.linalg.norm(mat, axis=1, keepdims=True)
        return mat / (norms + 1e-10)

    def _disable_api(self, err: Exception) -> None:
        if self.strict:
            raise err
        logger.warning(f"Gemini embeddings unavailable, fast-switching embedder to local LSA: {type(err).__name__}")
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
        self._embedding_cache: Dict[str, np.ndarray] = {}

    def index(self, chunks: List[Chunk]) -> None:
        self.chunks = list(chunks)
        if not chunks:
            self.chunk_embeddings = None
            return

        texts = [
            f"{' '.join(c.heading_path)} {c.section_heading} {c.text}"
            for c in chunks
        ]

        # Check which chunks need new embeddings
        uncached_indices = [i for i, c in enumerate(chunks) if c.chunk_id not in self._embedding_cache]

        if not self._embedding_cache:
            # First index run: fit semantic space and embed all
            self.embedder.fit_local_semantic_space(texts)
            embeddings = self.embedder.embed_batch(texts)
            for i, c in enumerate(chunks):
                self._embedding_cache[c.chunk_id] = embeddings[i]
        elif uncached_indices:
            # Incremental index run: embed only new chunks
            uncached_texts = [texts[i] for i in uncached_indices]
            new_embeddings = self.embedder.embed_batch(uncached_texts)
            for local_idx, orig_idx in enumerate(uncached_indices):
                self._embedding_cache[chunks[orig_idx].chunk_id] = new_embeddings[local_idx]

        # Assemble full matrix in chunk order
        self.chunk_embeddings = np.vstack([self._embedding_cache[c.chunk_id] for c in chunks])
        self._indexed_backend = self.embedder.active_backend

    def retrieve(self, query: str, top_k: int = 5, doc_id: Optional[str] = None) -> List[ScoredChunk]:
        if not self.chunks or self.chunk_embeddings is None:
            return []

        query_vec = self.embedder.embed_query(query)
        if self.embedder.active_backend != self._indexed_backend:
            # Embedder degraded after indexing (non-strict mode): rebuild index in the same space.
            self._embedding_cache.clear()
            self.index(self.chunks)
            query_vec = self.embedder.embed_query(query)
        q_norm = np.linalg.norm(query_vec)
        if q_norm < 1e-10:
            return []

        # Filter indices by doc_id if specified
        if doc_id is not None:
            candidate_indices = [i for i, c in enumerate(self.chunks) if c.doc_id == doc_id]
            if not candidate_indices:
                return []
            candidate_embeddings = self.chunk_embeddings[candidate_indices]
            scores = np.dot(candidate_embeddings, query_vec)
            k = min(top_k, len(candidate_indices))
            sorted_order = np.argsort(scores)[::-1][:k]
            top_indices = [candidate_indices[idx] for idx in sorted_order]
            top_scores = scores[sorted_order]
        else:
            scores = np.dot(self.chunk_embeddings, query_vec)
            k = min(top_k, len(self.chunks))
            top_indices = np.argsort(scores)[::-1][:k]
            top_scores = scores[top_indices]

        results = []
        for rank, (idx, score) in enumerate(zip(top_indices, top_scores), start=1):
            results.append(
                ScoredChunk(
                    chunk=self.chunks[idx],
                    score=float(score),
                    dense_score=float(score),
                    lexical_score=None,
                    rank=rank,
                )
            )
        return results
