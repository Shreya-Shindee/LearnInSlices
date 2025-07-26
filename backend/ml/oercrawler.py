"""
Open Educational Resource (OER) Content Crawler
Searches, extracts, and indexes free educational content from various sources

Key Features:
- Multi-source content discovery (Wikipedia, Khan Academy, MIT OpenCourseWare)
- Content quality assessment and filtering
- Metadata extraction and structured storage
- Semantic embedding generation for similarity search
- Rate limiting and respectful crawling practices
"""

import asyncio
import aiohttp
import time
from typing import List, Dict, Optional, Tuple
from urllib.parse import urljoin, urlparse
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
import hashlib
import json

import requests
from bs4 import BeautifulSoup
import numpy as np
from sentence_transformers import SentenceTransformer


@dataclass
class OERResource:
    """
    Structured representation of an Open Educational Resource
    """
    title: str
    content: str
    url: str
    source: str
    topic: str
    difficulty_level: str = "beginner"
    content_type: str = "article"  # article, video, exercise, course
    language: str = "en"

    # Metadata
    author: Optional[str] = None
    published_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    license: str = "unknown"

    # Quality metrics
    word_count: int = 0
    readability_score: float = 0.0
    has_examples: bool = False
    has_exercises: bool = False

    # AI processing
    embedding: Optional[List[float]] = None
    keywords: List[str] = field(default_factory=list)
    summary: str = ""

    # Internal tracking
    crawled_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc))
    content_hash: str = field(init=False)

    def __post_init__(self):
        """Calculate content hash for deduplication"""
        content_str = f"{self.title}{self.content}{self.url}"
        self.content_hash = hashlib.md5(content_str.encode()).hexdigest()
        self.word_count = len(self.content.split())


class WikipediaOERCrawler:
    """
    Crawls Wikipedia for educational content on specific topics
    """

    def __init__(self, rate_limit_delay: float = 1.0):
        """
        Initialize Wikipedia crawler

        Args:
            rate_limit_delay: Delay between requests in seconds
        """
        self.base_url = "https://en.wikipedia.org"
        self.api_url = "https://en.wikipedia.org/api/rest_v1"
        self.rate_limit_delay = rate_limit_delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'LearnInSlices/1.0 (Educational Content Crawler)'
        })

    def search_topics(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search Wikipedia for articles related to a topic

        Args:
            query: Search query
            limit: Maximum number of results

        Returns:
            List of article metadata
        """
        search_url = f"{self.api_url}/page/opensearch/{query}"

        try:
            time.sleep(self.rate_limit_delay)
            response = self.session.get(search_url, params={'limit': limit})
            response.raise_for_status()

            data = response.json()
            if len(data) >= 4:
                titles, descriptions, urls = data[1], data[2], data[3]
                return [
                    {
                        'title': title,
                        'description': desc,
                        'url': url,
                        'source': 'wikipedia'
                    }
                    for title, desc, url in zip(titles, descriptions, urls)
                ]
        except Exception as e:
            print(f"Error searching Wikipedia: {e}")

        return []

    def extract_article_content(self, title: str) -> Optional[OERResource]:
        """
        Extract full content from a Wikipedia article

        Args:
            title: Wikipedia article title

        Returns:
            OERResource with extracted content or None if failed
        """
        try:
            # Get article content via API
            content_url = f"{self.api_url}/page/summary/{title}"
            time.sleep(self.rate_limit_delay)

            response = self.session.get(content_url)
            response.raise_for_status()
            summary_data = response.json()

            # Get full article HTML for detailed content
            html_url = f"{self.base_url}/wiki/{title}"
            time.sleep(self.rate_limit_delay)

            html_response = self.session.get(html_url)
            html_response.raise_for_status()

            soup = BeautifulSoup(html_response.content, 'html.parser')

            # Extract main content
            content_div = soup.find('div', {'id': 'mw-content-text'})
            if not content_div:
                return None

            # Remove navigation, infoboxes, and other non-content elements
            for element in content_div.find_all(
                    ['table', 'div'], class_=['navbox', 'infobox', 'toc']):
                element.decompose()

            # Extract paragraphs
            paragraphs = content_div.find_all('p')
            content_text = '\n\n'.join([p.get_text().strip() for p in paragraphs
                                       if p.get_text().strip()])

            # Check for examples and exercises
            has_examples = bool(
                re.search(
                    r'\bexample\b|\bfor instance\b|\be\.g\.\b',
                    content_text,
                    re.IGNORECASE))
            has_exercises = bool(
                re.search(
                    r'\bexercise\b|\bpractice\b|\bproblem\b',
                    content_text,
                    re.IGNORECASE))

            return OERResource(
                title=summary_data.get('title', title),
                content=content_text,
                url=html_url,
                source='wikipedia',
                topic=self._extract_topic_from_title(title),
                content_type='article',
                summary=summary_data.get('extract', '')[:500],
                license='CC BY-SA',
                has_examples=has_examples,
                has_exercises=has_exercises,
                readability_score=self._calculate_readability(content_text)
            )

        except Exception as e:
            print(f"Error extracting article '{title}': {e}")
            return None

    def _extract_topic_from_title(self, title: str) -> str:
        """Extract general topic from article title"""
        # Simple topic extraction - could be enhanced with NLP
        programming_keywords = [
            'python',
            'javascript',
            'programming',
            'code',
            'software']
        math_keywords = [
            'mathematics',
            'algebra',
            'calculus',
            'geometry',
            'statistics']
        science_keywords = ['physics', 'chemistry', 'biology', 'science']

        title_lower = title.lower()

        if any(keyword in title_lower for keyword in programming_keywords):
            return 'programming'
        elif any(keyword in title_lower for keyword in math_keywords):
            return 'mathematics'
        elif any(keyword in title_lower for keyword in science_keywords):
            return 'science'
        else:
            return 'general'

    def _calculate_readability(self, text: str) -> float:
        """
        Calculate simple readability score (Flesch Reading Ease approximation)
        """
        if not text:
            return 0.0

        # Count sentences, words, and syllables
        sentences = len(re.findall(r'[.!?]+', text))
        words = len(text.split())

        if sentences == 0 or words == 0:
            return 0.0

        # Simple syllable counting (vowel groups)
        syllables = len(re.findall(r'[aeiouAEIOU]+', text))

        # Simplified Flesch Reading Ease
        if syllables > 0:
            score = 206.835 - (1.015 * (words / sentences)) - \
                (84.6 * (syllables / words))
            return max(0.0, min(100.0, score))

        return 50.0  # Average score if calculation fails


class KhanAcademyOERCrawler:
    """
    Crawls Khan Academy for educational video content and exercises
    """

    def __init__(self, rate_limit_delay: float = 1.0):
        self.base_url = "https://www.khanacademy.org"
        self.rate_limit_delay = rate_limit_delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'LearnInSlices/1.0 (Educational Content Crawler)'
        })

    def search_content(
            self,
            topic: str,
            content_type: str = "video") -> List[Dict]:
        """
        Search Khan Academy content (Note: This is a simplified implementation)
        In production, you'd use Khan Academy's API or more sophisticated scraping
        """
        # Placeholder implementation - would need to handle Khan Academy's
        # structure
        search_results = [
            {
                'title': f"Introduction to {topic}",
                'description': f"Learn the basics of {topic}",
                'url': f"{self.base_url}/search?query={topic}",
                'source': 'khan_academy',
                'content_type': content_type
            }
        ]
        return search_results


class MITOpenCourseWareCrawler:
    """
    Crawls MIT OpenCourseWare for course materials and lectures
    """

    def __init__(self, rate_limit_delay: float = 1.0):
        self.base_url = "https://ocw.mit.edu"
        self.rate_limit_delay = rate_limit_delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'LearnInSlices/1.0 (Educational Content Crawler)'
        })

    def search_courses(self, subject: str) -> List[Dict]:
        """
        Search MIT OCW for courses in a subject area
        """
        # Simplified implementation - would use OCW's search API
        return [
            {
                'title': f"Introduction to {subject}",
                'description': f"MIT course on {subject}",
                'url': f"{self.base_url}/search/?q={subject}",
                'source': 'mit_ocw',
                'content_type': 'course'
            }
        ]


class OERContentAggregator:
    """
    Aggregates content from multiple OER sources and manages the crawling process
    """

    def __init__(self, embedding_model: str = "all-MiniLM-L6-v2"):
        """
        Initialize the content aggregator

        Args:
            embedding_model: SentenceTransformer model for embeddings
        """
        self.wikipedia_crawler = WikipediaOERCrawler()
        self.khan_crawler = KhanAcademyOERCrawler()
        self.mit_crawler = MITOpenCourseWareCrawler()

        # Initialize embedding model
        print(f"Loading embedding model: {embedding_model}")
        self.embedding_model = SentenceTransformer(embedding_model)

        # Content storage
        self.resources: List[OERResource] = []
        self.content_hashes: set = set()

    def crawl_topic(
            self,
            topic: str,
            max_resources: int = 20) -> List[OERResource]:
        """
        Crawl multiple sources for content on a specific topic

        Args:
            topic: Topic to search for
            max_resources: Maximum number of resources to collect

        Returns:
            List of collected OER resources
        """
        print(f"🔍 Crawling content for topic: {topic}")
        collected_resources = []

        # Search Wikipedia
        print("📚 Searching Wikipedia...")
        wiki_results = self.wikipedia_crawler.search_topics(topic, limit=10)

        for result in wiki_results[:5]:  # Limit to avoid overwhelming
            resource = self.wikipedia_crawler.extract_article_content(
                result['title']
            )
            if resource and self._is_unique_content(resource):
                resource.embedding = self._generate_embedding(resource.content)
                resource.keywords = self._extract_keywords(resource.content)
                collected_resources.append(resource)
                self.content_hashes.add(resource.content_hash)

                if len(collected_resources) >= max_resources:
                    break

        print(
            f"✓ Collected {
                len(collected_resources)} resources from Wikipedia")

        # Add other sources (Khan Academy, MIT OCW) - simplified for demo
        # In production, these would be fully implemented

        self.resources.extend(collected_resources)
        return collected_resources

    def _is_unique_content(self, resource: OERResource) -> bool:
        """Check if content is unique (not already crawled)"""
        return resource.content_hash not in self.content_hashes

    def _generate_embedding(self, text: str) -> List[float]:
        """Generate semantic embedding for text content"""
        try:
            # Truncate text if too long for the model
            max_length = 512  # Typical transformer limit
            words = text.split()
            if len(words) > max_length:
                text = ' '.join(words[:max_length])

            embedding = self.embedding_model.encode(
                text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return []

    def _extract_keywords(
            self,
            text: str,
            max_keywords: int = 10) -> List[str]:
        """
        Extract keywords from text using simple frequency analysis
        In production, would use more sophisticated NLP techniques
        """
        # Simple keyword extraction
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())

        # Filter out common stop words
        stop_words = {
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
            'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
            'before', 'after', 'above', 'below', 'between', 'among', 'is',
            'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do',
            'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
            'must', 'can', 'this', 'that', 'these', 'those', 'what', 'which',
            'who', 'where', 'when', 'why', 'how'
        }

        filtered_words = [word for word in words if word not in stop_words]

        # Count frequency
        word_freq = {}
        for word in filtered_words:
            word_freq[word] = word_freq.get(word, 0) + 1

        # Get top keywords
        sorted_words = sorted(
            word_freq.items(),
            key=lambda x: x[1],
            reverse=True)
        return [word for word, freq in sorted_words[:max_keywords]]

    def find_similar_content(
            self, query: str, top_k: int = 5) -> List[Tuple[OERResource, float]]:
        """
        Find content similar to a query using semantic embeddings

        Args:
            query: Search query
            top_k: Number of similar resources to return

        Returns:
            List of (resource, similarity_score) tuples
        """
        if not self.resources:
            return []

        # Generate query embedding
        query_embedding = np.array(self._generate_embedding(query))

        similarities = []
        for resource in self.resources:
            if resource.embedding:
                resource_embedding = np.array(resource.embedding)
                # Cosine similarity
                similarity = np.dot(query_embedding, resource_embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(resource_embedding)
                )
                similarities.append((resource, float(similarity)))

        # Sort by similarity and return top k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

    def get_content_statistics(self) -> Dict:
        """Get statistics about crawled content"""
        if not self.resources:
            return {}

        total_resources = len(self.resources)
        total_words = sum(r.word_count for r in self.resources)
        avg_readability = sum(
            r.readability_score for r in self.resources) / total_resources

        sources = {}
        topics = {}
        content_types = {}

        for resource in self.resources:
            sources[resource.source] = sources.get(resource.source, 0) + 1
            topics[resource.topic] = topics.get(resource.topic, 0) + 1
            content_types[resource.content_type] = content_types.get(
                resource.content_type, 0) + 1

        return {
            'total_resources': total_resources,
            'total_words': total_words,
            'average_readability': avg_readability,
            'sources': sources,
            'topics': topics,
            'content_types': content_types,
            'resources_with_examples': sum(
                1 for r in self.resources if r.has_examples),
            'resources_with_exercises': sum(
                1 for r in self.resources if r.has_exercises)}

    def export_resources(self, filename: str):
        """Export collected resources to JSON file"""
        export_data = []
        for resource in self.resources:
            data = {
                'title': resource.title,
                'content': resource.content[:1000],  # Truncate for export
                'url': resource.url,
                'source': resource.source,
                'topic': resource.topic,
                'difficulty_level': resource.difficulty_level,
                'content_type': resource.content_type,
                'word_count': resource.word_count,
                'readability_score': resource.readability_score,
                'has_examples': resource.has_examples,
                'has_exercises': resource.has_exercises,
                'keywords': resource.keywords,
                'summary': resource.summary,
                'crawled_at': resource.crawled_at.isoformat()
            }
            export_data.append(data)

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)

        print(f"✓ Exported {len(export_data)} resources to {filename}")


# Async version for high-performance crawling
class AsyncOERCrawler:
    """
    Asynchronous version of OER crawler for high-performance content collection
    """

    def __init__(self, max_concurrent: int = 10,
                 rate_limit_delay: float = 1.0):
        self.max_concurrent = max_concurrent
        self.rate_limit_delay = rate_limit_delay
        self.semaphore = asyncio.Semaphore(max_concurrent)

    async def crawl_urls_async(self, urls: List[str]) -> List[OERResource]:
        """
        Crawl multiple URLs concurrently
        """
        async with aiohttp.ClientSession() as session:
            tasks = [self._crawl_single_url(session, url) for url in urls]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Filter out exceptions and None results
            return [r for r in results if isinstance(r, OERResource)]

    async def _crawl_single_url(self,
                                session: aiohttp.ClientSession,
                                url: str) -> Optional[OERResource]:
        """Crawl a single URL asynchronously"""
        async with self.semaphore:
            try:
                await asyncio.sleep(self.rate_limit_delay)
                async with session.get(url) as response:
                    if response.status == 200:
                        content = await response.text()
                        # Process content and return OERResource
                        # Implementation would depend on the specific site
                        # structure
                        return None
            except Exception as e:
                print(f"Error crawling {url}: {e}")
                return None
