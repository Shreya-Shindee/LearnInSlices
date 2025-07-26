"""
Embeddings Pipeline for Semantic Content Processing
Handles vector embeddings for content similarity and semantic search

Key Features:
- Multiple embedding model support (SentenceTransformers, HuggingFace)
- Batch processing for efficiency
- Vector similarity search
- Content clustering and recommendation
- Embedding storage and retrieval
"""

import numpy as np
import torch
from typing import List, Dict, Tuple, Optional, Union
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModel
import pickle
import json
from pathlib import Path
import logging
from dataclasses import dataclass
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import faiss  # For efficient similarity search


@dataclass
class EmbeddingConfig:
    """Configuration for embedding generation"""
    model_name: str = "all-MiniLM-L6-v2"
    max_length: int = 512
    batch_size: int = 32
    device: str = "auto"  # auto, cpu, cuda
    normalize: bool = True
    pooling_strategy: str = "mean"  # mean, cls, max


class EmbeddingGenerator:
    """
    Generates and manages semantic embeddings for text content
    """

    def __init__(self, config: EmbeddingConfig = None):
        """
        Initialize embedding generator

        Args:
            config: Embedding configuration
        """
        self.config = config or EmbeddingConfig()
        self.model = None
        self.tokenizer = None
        self.device = self._get_device()

        # Initialize model
        self._load_model()

        # Embedding cache
        self.embedding_cache: Dict[str, np.ndarray] = {}

        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def _get_device(self) -> str:
        """Determine the best device to use"""
        if self.config.device == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        return self.config.device

    def _load_model(self):
        """Load the embedding model"""
        try:
            self.logger.info(f"Loading model: {self.config.model_name}")

            # Use SentenceTransformers for simplicity
            self.model = SentenceTransformer(self.config.model_name)
            self.model.to(self.device)

            self.logger.info(f"Model loaded successfully on {self.device}")

        except Exception as e:
            self.logger.error(f"Error loading model: {e}")
            raise

    def generate_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding for a single text

        Args:
            text: Input text

        Returns:
            Embedding vector as numpy array
        """
        # Check cache first
        text_hash = str(hash(text))
        if text_hash in self.embedding_cache:
            return self.embedding_cache[text_hash]

        try:
            # Preprocess text
            processed_text = self._preprocess_text(text)

            # Generate embedding
            embedding = self.model.encode(
                processed_text,
                convert_to_numpy=True,
                normalize_embeddings=self.config.normalize
            )

            # Cache result
            self.embedding_cache[text_hash] = embedding

            return embedding

        except Exception as e:
            self.logger.error(f"Error generating embedding: {e}")
            return np.zeros(self.model.get_sentence_embedding_dimension())

    def generate_embeddings_batch(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for multiple texts efficiently

        Args:
            texts: List of input texts

        Returns:
            Matrix of embeddings (texts x embedding_dim)
        """
        try:
            # Preprocess texts
            processed_texts = [self._preprocess_text(text) for text in texts]

            # Generate embeddings in batches
            embeddings = self.model.encode(
                processed_texts,
                batch_size=self.config.batch_size,
                convert_to_numpy=True,
                normalize_embeddings=self.config.normalize,
                show_progress_bar=len(texts) > 10
            )

            return embeddings

        except Exception as e:
            self.logger.error(f"Error generating batch embeddings: {e}")
            # Return zero embeddings as fallback
            dim = self.model.get_sentence_embedding_dimension()
            return np.zeros((len(texts), dim))

    def _preprocess_text(self, text: str) -> str:
        """
        Preprocess text before embedding generation

        Args:
            text: Raw input text

        Returns:
            Processed text
        """
        # Basic preprocessing
        if not text or not text.strip():
            return ""

        # Truncate to max length (rough word-based truncation)
        words = text.split()
        if len(words) > self.config.max_length:
            text = ' '.join(words[:self.config.max_length])

        # Clean up whitespace
        text = ' '.join(text.split())

        return text

    def compute_similarity(self, embedding1: np.ndarray,
                           embedding2: np.ndarray) -> float:
        """
        Compute cosine similarity between two embeddings

        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector

        Returns:
            Cosine similarity score (-1 to 1)
        """
        return float(cosine_similarity([embedding1], [embedding2])[0][0])

    def find_most_similar(self, query_embedding: np.ndarray,
                          candidate_embeddings: np.ndarray,
                          top_k: int = 5) -> List[Tuple[int, float]]:
        """
        Find most similar embeddings to a query

        Args:
            query_embedding: Query embedding vector
            candidate_embeddings: Matrix of candidate embeddings
            top_k: Number of top results to return

        Returns:
            List of (index, similarity_score) tuples
        """
        similarities = cosine_similarity(
            [query_embedding], candidate_embeddings)[0]

        # Get top k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]

        return [(int(idx), float(similarities[idx])) for idx in top_indices]

    def save_embeddings(self, embeddings: np.ndarray,
                        metadata: List[Dict], filename: str):
        """
        Save embeddings and metadata to disk

        Args:
            embeddings: Embedding matrix
            metadata: List of metadata dicts for each embedding
            filename: Output filename (without extension)
        """
        save_path = Path(filename)
        save_path.parent.mkdir(parents=True, exist_ok=True)

        # Save embeddings as numpy array
        np.save(f"{save_path}.npy", embeddings)

        # Save metadata as JSON
        with open(f"{save_path}_metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)

        self.logger.info(f"Saved {len(embeddings)} embeddings to {filename}")

    def load_embeddings(self, filename: str) -> Tuple[np.ndarray, List[Dict]]:
        """
        Load embeddings and metadata from disk

        Args:
            filename: Input filename (without extension)

        Returns:
            Tuple of (embeddings, metadata)
        """
        save_path = Path(filename)

        # Load embeddings
        embeddings = np.load(f"{save_path}.npy")

        # Load metadata
        with open(f"{save_path}_metadata.json", 'r') as f:
            metadata = json.load(f)

        self.logger.info(
            f"Loaded {
                len(embeddings)} embeddings from {filename}")
        return embeddings, metadata


class SemanticSearchEngine:
    """
    High-performance semantic search using FAISS for vector similarity
    """

    def __init__(self, embedding_dim: int = 384):
        """
        Initialize semantic search engine

        Args:
            embedding_dim: Dimension of embedding vectors
        """
        self.embedding_dim = embedding_dim
        self.index = None
        self.metadata: List[Dict] = []
        self.is_trained = False

        # Initialize FAISS index (using inner product for cosine similarity)
        self.index = faiss.IndexFlatIP(embedding_dim)

        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def add_embeddings(self, embeddings: np.ndarray, metadata: List[Dict]):
        """
        Add embeddings to the search index

        Args:
            embeddings: Embedding matrix (n_samples x embedding_dim)
            metadata: List of metadata dicts for each embedding
        """
        if embeddings.shape[1] != self.embedding_dim:
            raise ValueError(
                f"Embedding dimension mismatch: expected {
                    self.embedding_dim}, " f"got {
                    embeddings.shape[1]}")

        # Normalize embeddings for cosine similarity
        normalized_embeddings = embeddings / \
            np.linalg.norm(embeddings, axis=1, keepdims=True)

        # Add to index
        self.index.add(normalized_embeddings.astype(np.float32))

        # Store metadata
        self.metadata.extend(metadata)

        self.logger.info(f"Added {len(embeddings)} embeddings to search index")

    def search(self, query_embedding: np.ndarray,
               k: int = 5) -> List[Tuple[Dict, float]]:
        """
        Search for similar embeddings

        Args:
            query_embedding: Query embedding vector
            k: Number of results to return

        Returns:
            List of (metadata, similarity_score) tuples
        """
        if self.index.ntotal == 0:
            return []

        # Normalize query embedding
        normalized_query = query_embedding / np.linalg.norm(query_embedding)
        normalized_query = normalized_query.astype(np.float32).reshape(1, -1)

        # Search
        similarities, indices = self.index.search(normalized_query, k)

        results = []
        for i, (similarity, idx) in enumerate(
                zip(similarities[0], indices[0])):
            if idx < len(self.metadata):  # Valid index
                results.append((self.metadata[idx], float(similarity)))

        return results

    def save_index(self, filename: str):
        """Save the search index to disk"""
        faiss.write_index(self.index, f"{filename}.index")

        with open(f"{filename}_metadata.json", 'w') as f:
            json.dump(self.metadata, f, indent=2)

        self.logger.info(f"Saved search index to {filename}")

    def load_index(self, filename: str):
        """Load the search index from disk"""
        self.index = faiss.read_index(f"{filename}.index")

        with open(f"{filename}_metadata.json", 'r') as f:
            self.metadata = json.load(f)

        self.logger.info(f"Loaded search index from {filename}")


class ContentClusterer:
    """
    Clusters content based on semantic embeddings for content organization
    """

    def __init__(self, n_clusters: int = 10, random_state: int = 42):
        """
        Initialize content clusterer

        Args:
            n_clusters: Number of clusters to create
            random_state: Random seed for reproducibility
        """
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=random_state)
        self.cluster_centers = None
        self.cluster_labels = None

        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def fit_predict(self, embeddings: np.ndarray) -> np.ndarray:
        """
        Cluster embeddings and return cluster labels

        Args:
            embeddings: Embedding matrix

        Returns:
            Array of cluster labels
        """
        self.logger.info(
            f"Clustering {
                len(embeddings)} embeddings into {
                self.n_clusters} clusters")

        self.cluster_labels = self.kmeans.fit_predict(embeddings)
        self.cluster_centers = self.kmeans.cluster_centers_

        return self.cluster_labels

    def predict(self, embeddings: np.ndarray) -> np.ndarray:
        """
        Predict cluster labels for new embeddings

        Args:
            embeddings: New embedding matrix

        Returns:
            Array of predicted cluster labels
        """
        if self.cluster_centers is None:
            raise ValueError("Clusterer must be fitted first")

        return self.kmeans.predict(embeddings)

    def get_cluster_info(self, embeddings: np.ndarray,
                         metadata: List[Dict]) -> Dict[int, Dict]:
        """
        Get information about each cluster

        Args:
            embeddings: Embedding matrix used for clustering
            metadata: Metadata for each embedding

        Returns:
            Dictionary with cluster information
        """
        if self.cluster_labels is None:
            raise ValueError("Clusterer must be fitted first")

        cluster_info = {}

        for cluster_id in range(self.n_clusters):
            cluster_mask = self.cluster_labels == cluster_id
            cluster_embeddings = embeddings[cluster_mask]
            cluster_metadata = [metadata[i]
                                for i in range(len(metadata)) if cluster_mask[i]]

            # Calculate cluster statistics
            cluster_size = len(cluster_metadata)
            if cluster_size > 0:
                # Average distance to center
                center = self.cluster_centers[cluster_id]
                distances = [np.linalg.norm(emb - center)
                             for emb in cluster_embeddings]
                avg_distance = np.mean(distances)

                # Extract common topics/keywords if available
                topics = [item.get('topic', 'unknown')
                          for item in cluster_metadata]
                most_common_topic = max(
                    set(topics), key=topics.count) if topics else 'unknown'

                cluster_info[cluster_id] = {
                    'size': cluster_size,
                    'avg_distance_to_center': float(avg_distance),
                    'most_common_topic': most_common_topic,
                    'sample_titles': [item.get('title', 'No title')[:50]
                                      for item in cluster_metadata[:3]]
                }
            else:
                cluster_info[cluster_id] = {
                    'size': 0,
                    'avg_distance_to_center': 0.0,
                    'most_common_topic': 'empty',
                    'sample_titles': []
                }

        return cluster_info


class EmbeddingPipeline:
    """
    Complete pipeline for embedding generation, search, and clustering
    """

    def __init__(self, config: EmbeddingConfig = None):
        """
        Initialize the complete embedding pipeline

        Args:
            config: Embedding configuration
        """
        self.config = config or EmbeddingConfig()
        self.generator = EmbeddingGenerator(self.config)
        self.search_engine = None
        self.clusterer = None

        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def process_content(self, content_list: List[Dict],
                        cluster: bool = True) -> Dict:
        """
        Process a list of content items through the complete pipeline

        Args:
            content_list: List of content dictionaries with 'text' field
            cluster: Whether to perform clustering

        Returns:
            Processing results dictionary
        """
        self.logger.info(f"Processing {len(content_list)} content items")

        # Extract text content
        texts = [item.get('text', '') for item in content_list]

        # Generate embeddings
        self.logger.info("Generating embeddings...")
        embeddings = self.generator.generate_embeddings_batch(texts)

        # Initialize search engine
        self.logger.info("Building search index...")
        embedding_dim = embeddings.shape[1]
        self.search_engine = SemanticSearchEngine(embedding_dim)
        self.search_engine.add_embeddings(embeddings, content_list)

        results = {
            'embeddings': embeddings,
            'search_engine': self.search_engine,
            'content_count': len(content_list)
        }

        # Perform clustering if requested
        if cluster and len(
                content_list) >= 3:  # Need minimum items for clustering
            self.logger.info("Performing content clustering...")
            # Adaptive cluster count
            n_clusters = min(10, max(2, len(content_list) // 5))
            self.clusterer = ContentClusterer(n_clusters=n_clusters)
            cluster_labels = self.clusterer.fit_predict(embeddings)
            cluster_info = self.clusterer.get_cluster_info(
                embeddings, content_list)

            results.update({
                'cluster_labels': cluster_labels,
                'cluster_info': cluster_info,
                'clusterer': self.clusterer
            })

        self.logger.info("Pipeline processing complete")
        return results

    def search_content(
            self, query: str, k: int = 5) -> List[Tuple[Dict, float]]:
        """
        Search processed content using semantic similarity

        Args:
            query: Search query
            k: Number of results to return

        Returns:
            List of (content, similarity_score) tuples
        """
        if not self.search_engine:
            raise ValueError("Content must be processed first")

        # Generate query embedding
        query_embedding = self.generator.generate_embedding(query)

        # Search
        return self.search_engine.search(query_embedding, k)

    def recommend_similar_content(self, content_index: int,
                                  k: int = 3) -> List[Tuple[Dict, float]]:
        """
        Recommend content similar to a given content item

        Args:
            content_index: Index of the reference content
            k: Number of recommendations to return

        Returns:
            List of (content, similarity_score) tuples
        """
        if not self.search_engine or content_index >= len(
                self.search_engine.metadata):
            raise ValueError(
                "Invalid content index or search engine not initialized")

        # Get embedding for the reference content
        reference_metadata = self.search_engine.metadata[content_index]
        reference_text = reference_metadata.get('text', '')
        reference_embedding = self.generator.generate_embedding(reference_text)

        # Search for similar content (exclude the reference itself)
        results = self.search_engine.search(reference_embedding, k + 1)

        # Filter out the reference content
        filtered_results = [
            (content, score) for content, score in results
            if content != reference_metadata
        ]

        return filtered_results[:k]
