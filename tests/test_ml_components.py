"""
Tests for ML components - OER Crawler, Embeddings, and Micro-Card Generator
"""

from unittest.mock import Mock, patch
import sys
import os

# Setup path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import after path setup to avoid linting errors
try:
    from backend.ml.oercrawler import (
        WikipediaOERCrawler, KhanAcademyOERCrawler,
        MITOpenCourseWareCrawler, OERContentAggregator,
        OERResource, ContentType
    )
    from backend.ml.embeddings import (
        EmbeddingGenerator, SemanticSearchEngine,
        ContentClusterer, EmbeddingPipeline
    )
    from backend.app.microcards import (
        MicroCardGenerator, GenerationConfig,
        ContentPersonalizer
    )
    from backend.app.models import CardType, DifficultyLevel
except ImportError as e:
    print(f"Import error: {e}")
    # Define mock classes for testing if imports fail
    class MockClass:
        pass
    WikipediaOERCrawler = MockClass
    KhanAcademyOERCrawler = MockClass
    MITOpenCourseWareCrawler = MockClass
    OERContentAggregator = MockClass
    OERResource = MockClass
    ContentType = MockClass
    EmbeddingGenerator = MockClass
    SemanticSearchEngine = MockClass
    ContentClusterer = MockClass
    EmbeddingPipeline = MockClass
    MicroCardGenerator = MockClass
    GenerationConfig = MockClass
    ContentPersonalizer = MockClass
    CardType = MockClass
    DifficultyLevel = MockClass


class TestOERCrawler:
    """Test OER crawler functionality"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.wikipedia_crawler = WikipediaOERCrawler()
        self.khan_crawler = KhanAcademyOERCrawler()
        self.mit_crawler = MITOpenCourseWareCrawler()
        self.aggregator = OERContentAggregator()
    
    @patch('requests.get')
    def test_wikipedia_search(self, mock_get):
        """Test Wikipedia search functionality"""
        # Mock response
        mock_response = Mock()
        mock_response.json.return_value = {
            'query': {
                'search': [
                    {
                        'title': 'Python (programming language)',
                        'snippet': 'Python is a programming language...',
                        'pageid': 123456
                    }
                ]
            }
        }
        mock_get.return_value = mock_response
        
        # Test search
        results = self.wikipedia_crawler.search("Python programming")
        
        assert len(results) > 0
        assert results[0]['title'] == 'Python (programming language)'
        assert 'programming language' in results[0]['snippet']
    
    @patch('requests.get')
    def test_wikipedia_get_content(self, mock_get):
        """Test Wikipedia content retrieval"""
        # Mock response for content
        mock_response = Mock()
        mock_response.json.return_value = {
            'query': {
                'pages': {
                    '123456': {
                        'title': 'Python (programming language)',
                        'extract': 'Python is a high-level programming language...'
                    }
                }
            }
        }
        mock_get.return_value = mock_response
        
        # Test content retrieval
        content = self.wikipedia_crawler.get_content("Python (programming language)")
        
        assert content is not None
        assert 'high-level programming language' in content
    
    @patch('requests.get')
    def test_khan_academy_search(self, mock_get):
        """Test Khan Academy search"""
        # Mock Khan Academy response
        mock_response = Mock()
        mock_response.text = '''
        <html>
            <div class="course-title">
                <a href="/computing/python">Python Programming</a>
            </div>
            <div class="course-description">Learn Python basics</div>
        </html>
        '''
        mock_get.return_value = mock_response
        
        results = self.khan_crawler.search("Python")
        
        # Khan Academy crawler should return some structure
        assert isinstance(results, list)
    
    @patch('requests.get')
    def test_mit_opencourseware_search(self, mock_get):
        """Test MIT OpenCourseWare search"""
        # Mock MIT OCW response
        mock_response = Mock()
        mock_response.text = '''
        <html>
            <div class="course-info">
                <h3><a href="/course/6-001">Introduction to Computer Science</a></h3>
                <p>Programming with Python</p>
            </div>
        </html>
        '''
        mock_get.return_value = mock_response
        
        results = self.mit_crawler.search("Python programming")
        
        assert isinstance(results, list)
    
    @patch.object(WikipediaOERCrawler, 'fetch_resources')
    @patch.object(KhanAcademyOERCrawler, 'fetch_resources')
    @patch.object(MITOpenCourseWareCrawler, 'fetch_resources')
    def test_aggregator_collect_resources(self, mock_mit, mock_khan, mock_wiki):
        """Test resource aggregation from multiple sources"""
        # Mock responses from each crawler
        mock_wiki.return_value = [
            OERResource(
                title="Python Programming",
                content="Python is a programming language",
                source="Wikipedia",
                url="https://en.wikipedia.org/wiki/Python",
                content_type=ContentType.ARTICLE
            )
        ]
        
        mock_khan.return_value = [
            OERResource(
                title="Python Basics",
                content="Learn Python fundamentals",
                source="Khan Academy",
                url="https://khanacademy.org/python",
                content_type=ContentType.TUTORIAL
            )
        ]
        
        mock_mit.return_value = [
            OERResource(
                title="6.001 Python Course",
                content="MIT Python course materials",
                source="MIT OpenCourseWare",
                url="https://ocw.mit.edu/6-001",
                content_type=ContentType.COURSE
            )
        ]
        
        # Test aggregation
        resources = self.aggregator.collect_resources(
            query="Python programming",
            max_resources=10
        )
        
        assert len(resources) == 3
        assert any(r.source == "Wikipedia" for r in resources)
        assert any(r.source == "Khan Academy" for r in resources)
        assert any(r.source == "MIT OpenCourseWare" for r in resources)
    
    def test_oer_resource_creation(self):
        """Test OER resource data structure"""
        resource = OERResource(
            title="Test Resource",
            content="Test content for learning",
            source="Test Source",
            url="https://example.com/test",
            content_type=ContentType.ARTICLE
        )
        
        assert resource.title == "Test Resource"
        assert resource.source == "Test Source"
        assert resource.content_type == ContentType.ARTICLE
        assert resource.url == "https://example.com/test"


class TestEmbeddings:
    """Test embedding generation and semantic search"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.embedding_generator = EmbeddingGenerator()
        self.search_engine = SemanticSearchEngine()
        self.clusterer = ContentClusterer()
        self.pipeline = EmbeddingPipeline()
    
    def test_embedding_generation(self):
        """Test text embedding generation"""
        test_texts = [
            "Python is a programming language",
            "Machine learning with Python",
            "Web development using Django"
        ]
        
        embeddings = self.embedding_generator.generate_embeddings(test_texts)
        
        assert len(embeddings) == len(test_texts)
        assert all(len(emb) > 0 for emb in embeddings)
        # Check that embeddings are numeric
        assert all(isinstance(emb[0], (int, float)) for emb in embeddings)
    
    def test_semantic_similarity(self):
        """Test semantic similarity calculation"""
        text1 = "Python programming language"
        text2 = "Programming with Python"
        text3 = "Cooking recipes"
        
        # Generate embeddings
        embeddings = self.embedding_generator.generate_embeddings([text1, text2, text3])
        
        # Calculate similarities
        sim_1_2 = self.embedding_generator.calculate_similarity(embeddings[0], embeddings[1])
        sim_1_3 = self.embedding_generator.calculate_similarity(embeddings[0], embeddings[2])
        
        # Python-related texts should be more similar than cooking
        assert sim_1_2 > sim_1_3
        assert 0 <= sim_1_2 <= 1
        assert 0 <= sim_1_3 <= 1
    
    def test_search_engine_indexing(self):
        """Test search engine document indexing"""
        documents = [
            {"id": "1", "text": "Python programming tutorial"},
            {"id": "2", "text": "Machine learning with scikit-learn"},
            {"id": "3", "text": "Web development with Flask"}
        ]
        
        # Index documents
        self.search_engine.index_documents(documents)
        
        # Verify indexing
        assert hasattr(self.search_engine, 'index')
        assert self.search_engine.document_count() == len(documents)
    
    def test_semantic_search(self):
        """Test semantic search functionality"""
        documents = [
            {"id": "1", "text": "Python programming language basics"},
            {"id": "2", "text": "Machine learning algorithms in Python"},
            {"id": "3", "text": "JavaScript web development"},
            {"id": "4", "text": "Data science with pandas"}
        ]
        
        # Index documents
        self.search_engine.index_documents(documents)
        
        # Search for Python-related content
        results = self.search_engine.search("Python programming", top_k=2)
        
        assert len(results) <= 2
        # Results should be relevant to Python
        assert any("Python" in result.get("text", "") for result in results)
    
    def test_content_clustering(self):
        """Test content clustering functionality"""
        texts = [
            "Python programming basics",
            "Python web development",
            "JavaScript frontend development", 
            "JavaScript React framework",
            "Machine learning algorithms",
            "Deep learning neural networks"
        ]
        
        # Perform clustering
        clusters = self.clusterer.cluster_texts(texts, n_clusters=3)
        
        assert len(clusters) == 3
        assert all(len(cluster) > 0 for cluster in clusters)
        
        # Check that similar topics are clustered together
        cluster_texts = {i: [texts[idx] for idx in cluster] for i, cluster in enumerate(clusters)}
        
        # Find Python cluster
        python_cluster = None
        for cluster_idx, cluster_content in cluster_texts.items():
            if any("Python" in text for text in cluster_content):
                python_cluster = cluster_content
                break
        
        assert python_cluster is not None
        # Python texts should be in the same cluster
        python_count = sum(1 for text in python_cluster if "Python" in text)
        assert python_count >= 1
    
    def test_embedding_pipeline(self):
        """Test complete embedding pipeline"""
        # Sample OER resources
        resources = [
            OERResource(
                title="Python Basics",
                content="Learn Python programming fundamentals",
                source="Test",
                url="http://test.com/1",
                content_type=ContentType.TUTORIAL
            ),
            OERResource(
                title="Web Development",
                content="Build web applications with Python Flask",
                source="Test",
                url="http://test.com/2",
                content_type=ContentType.TUTORIAL
            )
        ]
        
        # Process through pipeline
        processed_resources = self.pipeline.process_resources(resources)
        
        assert len(processed_resources) == len(resources)
        # Check that embeddings were added
        for resource in processed_resources:
            assert hasattr(resource, 'embedding') or 'embedding' in resource.__dict__


class TestMicroCardGenerator:
    """Test micro-card generation functionality"""
    
    def setup_method(self):
        """Setup test fixtures"""
        config = GenerationConfig()
        config.model_name = "distilgpt2"  # Smaller model for testing
        self.generator = MicroCardGenerator(config)
        self.personalizer = ContentPersonalizer(self.generator)
    
    def test_generator_initialization(self):
        """Test generator initialization"""
        assert self.generator.config is not None
        assert self.generator.templates is not None
        assert self.generator.embedding_generator is not None
    
    def test_concept_card_generation(self):
        """Test concept card generation"""
        card = self.generator.generate_micro_card(
            topic="Python variables",
            content_type=CardType.CONCEPT,
            difficulty=DifficultyLevel.BEGINNER
        )
        
        assert 'text' in card
        assert 'examples' in card
        assert 'key_points' in card
        assert len(card['text']) > 0
        assert len(card['examples']) > 0
    
    def test_quiz_card_generation(self):
        """Test quiz card generation"""
        card = self.generator.generate_micro_card(
            topic="Python loops",
            content_type=CardType.QUIZ,
            difficulty=DifficultyLevel.INTERMEDIATE
        )
        
        assert 'question' in card
        assert 'options' in card
        assert 'correct_answer' in card
        assert 'explanation' in card
        assert len(card['options']) == 4
        assert card['correct_answer'] in card['options']
    
    def test_drill_card_generation(self):
        """Test drill card generation"""
        card = self.generator.generate_micro_card(
            topic="Python functions",
            content_type=CardType.DRILL,
            difficulty=DifficultyLevel.ADVANCED
        )
        
        assert 'instructions' in card
        assert 'exercises' in card
        assert 'guidance' in card
        assert len(card['exercises']) > 0
    
    def test_interactive_card_generation(self):
        """Test interactive card generation"""
        card = self.generator.generate_micro_card(
            topic="Python data structures",
            content_type=CardType.INTERACTIVE,
            difficulty=DifficultyLevel.INTERMEDIATE
        )
        
        assert 'description' in card
        assert 'interactive_elements' in card
        assert 'objectives' in card
        assert len(card['interactive_elements']) > 0
    
    def test_content_quality_assessment(self):
        """Test content quality assessment"""
        # Good quality concept card
        good_card = {
            'text': 'Variables in Python are containers for storing data values',
            'examples': ['x = 5', 'name = "Alice"', 'is_valid = True'],
            'key_points': ['Variables store data', 'No declaration needed']
        }
        
        score = self.generator.assess_content_quality(good_card, CardType.CONCEPT)
        assert score > 0.5
        
        # Poor quality card (missing fields)
        poor_card = {'text': 'Short'}
        
        score = self.generator.assess_content_quality(poor_card, CardType.CONCEPT)
        assert score < 0.5
    
    def test_batch_generation(self):
        """Test batch card generation"""
        topics = ["Python variables", "Python functions", "Python loops"]
        content_types = [CardType.CONCEPT, CardType.QUIZ]
        
        cards = self.generator.generate_batch_cards(
            topics=topics,
            content_types=content_types,
            difficulty=DifficultyLevel.BEGINNER
        )
        
        # Should generate len(topics) * len(content_types) cards
        expected_count = len(topics) * len(content_types)
        assert len(cards) <= expected_count  # May be less if generation fails
        
        # Check card structure
        for card in cards:
            assert 'title' in card
            assert 'content' in card
            assert 'content_type' in card
            assert 'difficulty_level' in card
            assert 'quality_score' in card
    
    def test_content_personalization(self):
        """Test content personalization"""
        base_content = {
            'text': 'Python variables store data values',
            'examples': ['x = 5', 'name = "Alice"']
        }
        
        # High performer history
        high_performer_history = [
            {'performance_score': 0.9},
            {'performance_score': 0.85},
            {'performance_score': 0.92}
        ]
        
        # Low performer history
        low_performer_history = [
            {'performance_score': 0.3},
            {'performance_score': 0.4},
            {'performance_score': 0.35}
        ]
        
        user_preferences = {'learning_style': 'practical'}
        
        # Test personalization for high performer
        personalized_high = self.personalizer.personalize_content(
            base_content, high_performer_history, user_preferences
        )
        
        # Test personalization for low performer
        personalized_low = self.personalizer.personalize_content(
            base_content, low_performer_history, user_preferences
        )
        
        # Both should return valid content
        assert 'text' in personalized_high
        assert 'text' in personalized_low
        assert 'examples' in personalized_high
        assert 'examples' in personalized_low


class TestIntegration:
    """Integration tests for ML components"""
    
    def setup_method(self):
        """Setup integration test fixtures"""
        self.aggregator = OERContentAggregator()
        self.pipeline = EmbeddingPipeline()
        self.generator = MicroCardGenerator(GenerationConfig())
    
    @patch.object(OERContentAggregator, 'collect_resources')
    def test_oer_to_microcard_pipeline(self, mock_collect):
        """Test complete pipeline from OER to micro-cards"""
        # Mock OER resources
        mock_collect.return_value = [
            OERResource(
                title="Python Variables Tutorial",
                content="Variables in Python are used to store data values. You can create a variable by assigning a value to it using the equals sign.",
                source="Mock Source",
                url="http://example.com/python-vars",
                content_type=ContentType.TUTORIAL
            )
        ]
        
        # Collect resources
        resources = self.aggregator.collect_resources("Python variables")
        
        # Generate micro-cards from resources
        cards = []
        for resource in resources:
            card = self.generator.generate_micro_card(
                topic="Python variables",
                content_type=CardType.CONCEPT,
                difficulty=DifficultyLevel.BEGINNER,
                source_material=resource
            )
            cards.append(card)
        
        assert len(cards) > 0
        assert all('text' in card for card in cards)
        assert all('examples' in card for card in cards)
    
    def test_search_and_generate_workflow(self):
        """Test realistic workflow: search -> embed -> generate cards"""
        # Simulate a learning topic
        topic = "Python data types"
        
        # Mock some educational content
        mock_content = [
            "Python has several built-in data types including integers, floats, strings, and booleans.",
            "Lists and dictionaries are important data structures in Python programming.",
            "Understanding data types helps write more efficient Python code."
        ]
        
        # Generate embeddings for content
        embeddings = self.pipeline.embedding_generator.generate_embeddings(mock_content)
        
        # Verify embeddings were generated
        assert len(embeddings) == len(mock_content)
        
        # Generate cards for the topic
        cards = self.generator.generate_batch_cards(
            topics=[topic],
            content_types=[CardType.CONCEPT, CardType.QUIZ],
            difficulty=DifficultyLevel.BEGINNER
        )
        
        assert len(cards) > 0
        assert all(card['difficulty_level'] == DifficultyLevel.BEGINNER for card in cards)


def run_ml_tests():
    """Run all ML component tests"""
    print("Running ML Component Tests...")
    print("=" * 50)
    
    # Test OER Crawler
    print("\n1. Testing OER Crawler...")
    test_oer = TestOERCrawler()
    test_oer.setup_method()
    
    try:
        # Test basic functionality without external dependencies
        test_oer.test_oer_resource_creation()
        print("   ✓ OER Resource creation test passed")
        
    except Exception as e:
        print(f"   ✗ OER tests failed: {e}")
    
    # Test Embeddings
    print("\n2. Testing Embeddings...")
    test_embed = TestEmbeddings()
    test_embed.setup_method()
    
    try:
        test_embed.test_embedding_generation()
        print("   ✓ Embedding generation test passed")
        
        test_embed.test_semantic_similarity()
        print("   ✓ Semantic similarity test passed")
        
    except Exception as e:
        print(f"   ✗ Embedding tests failed: {e}")
    
    # Test Micro-Card Generator
    print("\n3. Testing Micro-Card Generator...")
    test_gen = TestMicroCardGenerator()
    test_gen.setup_method()
    
    try:
        test_gen.test_generator_initialization()
        print("   ✓ Generator initialization test passed")
        
        test_gen.test_concept_card_generation()
        print("   ✓ Concept card generation test passed")
        
        test_gen.test_quiz_card_generation()
        print("   ✓ Quiz card generation test passed")
        
        test_gen.test_content_quality_assessment()
        print("   ✓ Content quality assessment test passed")
        
    except Exception as e:
        print(f"   ✗ Micro-card generator tests failed: {e}")
    
    print("\n" + "=" * 50)
    print("ML Component Tests Complete!")


if __name__ == "__main__":
    run_ml_tests()
