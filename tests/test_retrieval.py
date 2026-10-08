import unittest
from src.core.models import Chunk
from src.retrieval.bm25 import BM25Retriever
from src.retrieval.dense import DenseRetriever, DenseVectorEmbedder
from src.retrieval.hybrid import HybridRetriever


class TestRetrieval(unittest.TestCase):

    def setUp(self):
        self.chunks = [
            Chunk(
                chunk_id="DOC-001#c001",
                doc_id="DOC-001",
                document_title="Telemetry Ingest",
                section_heading="gRPC Specifications",
                heading_path=["Ingest", "gRPC Specifications"],
                text="The maximum allowed gRPC frame size is 4,194,304 bytes (4.0 MB). If exceeded, payloads are rejected with RESOURCE_EXHAUSTED.",
                char_start=0,
                char_end=150,
                token_count=25,
            ),
            Chunk(
                chunk_id="DOC-002#c001",
                doc_id="DOC-002",
                document_title="Fault Tolerance",
                section_heading="Quorum and Raft",
                heading_path=["Consensus", "Quorum and Raft"],
                text="A minimum of 5 control nodes are required. Quorum is floor(N/2) + 1. Leader lease duration is 10.0 seconds.",
                char_start=0,
                char_end=140,
                token_count=23,
            ),
            Chunk(
                chunk_id="DOC-003#c001",
                doc_id="DOC-003",
                document_title="Retention Policy",
                section_heading="Hot Tier Storage",
                heading_path=["Storage", "Hot Tier Storage"],
                text="Hot tier retains uncompressed raw telemetry on NVMe SSD for exactly 7 calendar days before migration to warm.",
                char_start=0,
                char_end=130,
                token_count=21,
            ),
        ]

    def test_bm25_retrieval(self):
        retriever = BM25Retriever()
        retriever.index(self.chunks)
        results = retriever.retrieve("maximum allowed gRPC frame size", top_k=2)
        self.assertGreater(len(results), 0)
        self.assertEqual(results[0].chunk.chunk_id, "DOC-001#c001")

    def test_dense_retrieval(self):
        embedder = DenseVectorEmbedder(dimension=128)
        retriever = DenseRetriever(embedder=embedder)
        retriever.index(self.chunks)
        results = retriever.retrieve("raft quorum leader lease timer", top_k=2)
        self.assertGreater(len(results), 0)
        self.assertEqual(results[0].chunk.chunk_id, "DOC-002#c001")

    def test_hybrid_rrf_retrieval(self):
        hybrid = HybridRetriever(mode="hybrid_rrf")
        hybrid.index(self.chunks)
        results = hybrid.retrieve("hot tier nvme retention days", top_k=2)
        self.assertGreater(len(results), 0)
        self.assertEqual(results[0].chunk.chunk_id, "DOC-003#c001")
        self.assertGreater(results[0].score, 0.0)


if __name__ == "__main__":
    unittest.main()
