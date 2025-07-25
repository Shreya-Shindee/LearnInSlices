"""
Simplified tests for Stage 2 ML components
"""

import sys
import os
from unittest.mock import Mock, patch

# Add project to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))


def test_oer_crawler_basics():
    """Test basic OER crawler functionality"""
    try:
        from backend.ml.oercrawler import (
            OERResource, ContentType, OERContentAggregator
        )
        
        # Test OER resource creation
        resource = OERResource(
            title="Test Python Tutorial",
            content="Learn Python basics with this tutorial",
            source="Test Source",
            url="https://example.com/python",
            content_type=ContentType.TUTORIAL
        )
        
        assert resource.title == "Test Python Tutorial"
        assert resource.source == "Test Source"
        assert "Python basics" in resource.content
        print("✓ OER Resource creation test passed")
        
        # Test aggregator initialization
        aggregator = OERContentAggregator()
        assert aggregator is not None
        print("✓ OER Aggregator initialization test passed")
        
        return True
        
    except Exception as e:
        print(f"✗ OER Crawler tests failed: {e}")
        return False


def test_embeddings_basics():
    """Test basic embedding functionality"""
    try:
        from backend.ml.embeddings import EmbeddingGenerator
        
        # Test embedding generator initialization
        generator = EmbeddingGenerator()
        assert generator is not None
        print("✓ Embedding Generator initialization test passed")
        
        # Test embedding generation with simple texts
        test_texts = [
            "Python programming language",
            "Machine learning tutorial",
            "Web development guide"
        ]
        
        embeddings = generator.generate_embeddings(test_texts)
        assert len(embeddings) == len(test_texts)
        assert all(len(emb) > 0 for emb in embeddings)
        print("✓ Embedding generation test passed")
        
        # Test similarity calculation
        if len(embeddings) >= 2:
            similarity = generator.calculate_similarity(
                embeddings[0], embeddings[1]
            )
            assert 0 <= similarity <= 1
            print("✓ Similarity calculation test passed")
        
        return True
        
    except Exception as e:
        print(f"✗ Embeddings tests failed: {e}")
        return False


def test_microcard_generator_basics():
    """Test basic micro-card generation"""
    try:
        from backend.app.microcards import (
            MicroCardGenerator, GenerationConfig
        )
        from backend.app.models import CardType, DifficultyLevel
        
        # Test generator initialization
        config = GenerationConfig()
        generator = MicroCardGenerator(config)
        assert generator is not None
        assert generator.config is not None
        print("✓ Micro-card Generator initialization test passed")
        
        # Test concept card generation
        concept_card = generator.generate_micro_card(
            topic="Python variables",
            content_type=CardType.CONCEPT,
            difficulty=DifficultyLevel.BEGINNER
        )
        
        assert 'text' in concept_card
        assert 'examples' in concept_card
        assert len(concept_card['text']) > 0
        print("✓ Concept card generation test passed")
        
        # Test quiz card generation
        quiz_card = generator.generate_micro_card(
            topic="Python loops",
            content_type=CardType.QUIZ,
            difficulty=DifficultyLevel.INTERMEDIATE
        )
        
        assert 'question' in quiz_card
        assert 'options' in quiz_card
        assert 'correct_answer' in quiz_card
        assert len(quiz_card['options']) == 4
        print("✓ Quiz card generation test passed")
        
        # Test content quality assessment
        quality_score = generator.assess_content_quality(
            concept_card, CardType.CONCEPT
        )
        assert 0 <= quality_score <= 1
        print("✓ Content quality assessment test passed")
        
        return True
        
    except Exception as e:
        print(f"✗ Micro-card Generator tests failed: {e}")
        return False


def test_integration_basics():
    """Test basic integration between components"""
    try:
        from backend.ml.oercrawler import OERResource, ContentType
        from backend.app.microcards import MicroCardGenerator, GenerationConfig
        from backend.app.models import CardType, DifficultyLevel
        
        # Create a mock OER resource
        resource = OERResource(
            title="Python Functions Tutorial",
            content="Functions in Python help organize code into blocks",
            source="Test",
            url="https://example.com/functions",
            content_type=ContentType.TUTORIAL
        )
        
        # Generate micro-card from resource
        generator = MicroCardGenerator(GenerationConfig())
        card = generator.generate_micro_card(
            topic="Python functions",
            content_type=CardType.CONCEPT,
            difficulty=DifficultyLevel.BEGINNER,
            source_material=resource
        )
        
        assert 'text' in card
        assert 'examples' in card
        print("✓ OER to micro-card integration test passed")
        
        return True
        
    except Exception as e:
        print(f"✗ Integration tests failed: {e}")
        return False


def run_stage2_tests():
    """Run all Stage 2 component tests"""
    print("Stage 2 ML Components Test Suite")
    print("=" * 40)
    
    results = []
    
    print("\n1. Testing OER Crawler...")
    results.append(test_oer_crawler_basics())
    
    print("\n2. Testing Embeddings...")
    results.append(test_embeddings_basics())
    
    print("\n3. Testing Micro-card Generator...")
    results.append(test_microcard_generator_basics())
    
    print("\n4. Testing Integration...")
    results.append(test_integration_basics())
    
    print("\n" + "=" * 40)
    passed = sum(results)
    total = len(results)
    print(f"Tests completed: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All Stage 2 tests passed!")
        return True
    else:
        print("⚠️  Some tests failed - check dependencies")
        return False


if __name__ == "__main__":
    success = run_stage2_tests()
    sys.exit(0 if success else 1)
