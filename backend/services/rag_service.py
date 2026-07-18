"""RAG service: ChromaDB + HuggingFace embeddings + Groq LLM."""

from __future__ import annotations

import hashlib
import re
import uuid
from pathlib import Path
from typing import Any, Optional

from config import get_settings
from utils.helpers import extract_text_from_pdf

_CHROMA_DIR = Path(__file__).resolve().parent.parent / ".chroma_data"
_embeddings = None
_chroma_client = None


def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        from langchain_community.embeddings import HuggingFaceEmbeddings

        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
    return _embeddings


def _get_chroma():
    global _chroma_client
    if _chroma_client is None:
        import chromadb
        from chromadb.config import Settings as ChromaSettings

        _CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(
            path=str(_CHROMA_DIR),
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _chroma_client


def _chunk_text(text: str, chunk_size: int = 800, overlap: int = 120) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return chunks


class RAGService:
    """Per-user document collections for career mentoring / job prep."""

    def ensure_collection(self, collection_id: str):
        client = _get_chroma()
        return client.get_or_create_collection(
            name=collection_id[:63],
            metadata={"hnsw:space": "cosine"},
        )

    def ingest_text(
        self,
        collection_id: str,
        text: str,
        *,
        source: str,
        filename: str = "document",
        doc_id: Optional[str] = None,
    ) -> dict[str, Any]:
        doc_id = doc_id or str(uuid.uuid4())
        chunks = _chunk_text(text)
        if not chunks:
            return {"success": False, "error": "No text to embed", "chunks": 0}

        collection = self.ensure_collection(collection_id)
        embeddings = _get_embeddings()
        vectors = embeddings.embed_documents(chunks)
        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {"source": source, "filename": filename, "doc_id": doc_id, "chunk": i}
            for i in range(len(chunks))
        ]
        # Upsert
        collection.upsert(ids=ids, embeddings=vectors, documents=chunks, metadatas=metadatas)
        return {
            "success": True,
            "doc_id": doc_id,
            "chunks": len(chunks),
            "collection_id": collection_id,
            "filename": filename,
            "source": source,
        }

    def ingest_pdf_bytes(
        self,
        collection_id: str,
        file_bytes: bytes,
        *,
        filename: str,
        source: str = "mentor",
    ) -> dict[str, Any]:
        text = extract_text_from_pdf(file_bytes)
        if not text or len(text.strip()) < 40:
            return {"success": False, "error": "Could not extract enough text from PDF", "chunks": 0}
        return self.ingest_text(
            collection_id,
            text,
            source=source,
            filename=filename,
            doc_id=hashlib.md5(filename.encode()).hexdigest()[:12],
        )

    def retrieve(self, collection_id: str, query: str, k: int = 5) -> list[dict[str, Any]]:
        try:
            collection = self.ensure_collection(collection_id)
            if collection.count() == 0:
                return []
            embeddings = _get_embeddings()
            qvec = embeddings.embed_query(query)
            result = collection.query(query_embeddings=[qvec], n_results=min(k, max(1, collection.count())))
            docs = result.get("documents", [[]])[0]
            metas = result.get("metadatas", [[]])[0]
            dists = result.get("distances", [[]])[0]
            out = []
            for i, doc in enumerate(docs):
                out.append(
                    {
                        "text": doc,
                        "metadata": metas[i] if i < len(metas) else {},
                        "distance": dists[i] if i < len(dists) else None,
                    }
                )
            return out
        except Exception:
            return []

    def format_context(self, chunks: list[dict[str, Any]]) -> str:
        if not chunks:
            return "No retrieved documents."
        parts = []
        for i, c in enumerate(chunks, 1):
            meta = c.get("metadata") or {}
            src = meta.get("filename") or meta.get("source") or "doc"
            parts.append(f"[{i}] ({src})\n{c.get('text', '')}")
        return "\n\n".join(parts)


rag_service = RAGService()


def user_collection_id(user_id: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9_-]", "_", user_id)[:40]
    return f"cgps_{safe}"
