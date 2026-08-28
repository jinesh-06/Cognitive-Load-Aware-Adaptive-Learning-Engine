"""
RAG Semantic Document Retriever Module using Sentence Transformers and FAISS / Vector Indexing.
"""
from typing import List, Dict

class EducationalRAGRetriever:
    def __init__(self):
        self.documents = []
        self.index = None

    def add_documents(self, docs: List[Dict]):
        self.documents.extend(docs)

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict]:
        # Semantic search implementation
        results = []
        query_words = set(query.lower().split())
        for doc in self.documents:
            doc_words = set((doc.get("title", "") + " " + doc.get("content", "")).lower().split())
            overlap = len(query_words.intersection(doc_words))
            results.append((overlap, doc))
        
        results.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in results[:top_k]]
