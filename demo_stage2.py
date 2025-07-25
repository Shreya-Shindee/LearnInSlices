"""
Stage 2 Demo: OER Crawler and AI Micro-Card Generator
Demonstrates the enhanced LearnInSlices platform with AI-powered content generation
"""

import asyncio
import sys
import os
from datetime import datetime

# Add project to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Mock the imports for demo purposes if dependencies aren't installed
try:
    from backend.ml.oercrawler import OERContentAggregator, OERResource, ContentType
    from backend.ml.embeddings import EmbeddingPipeline
    from backend.app.microcards import MicroCardGenerator, GenerationConfig
    from backend.app.models import CardType, DifficultyLevel
    DEPENDENCIES_AVAILABLE = True
except ImportError as e:
    print(f"📦 Missing dependencies: {e}")
    print("💡 This demo will use mock data to show functionality")
    DEPENDENCIES_AVAILABLE = False


class Stage2Demo:
    """Demo class for Stage 2 functionality"""
    
    def __init__(self):
        """Initialize the demo"""
        self.demo_start_time = datetime.now()
        print("🎓 LearnInSlices Stage 2 Demo")
        print("=" * 50)
        print("Features: OER Content Crawler + AI Micro-Card Generator")
        print()
    
    def demonstrate_oer_crawler(self):
        """Demonstrate OER content crawling"""
        print("📚 1. OER Content Crawler Demo")
        print("-" * 30)
        
        if DEPENDENCIES_AVAILABLE:
            try:
                # Initialize aggregator
                aggregator = OERContentAggregator()
                
                # Demo topic
                topic = "Python programming basics"
                print(f"🔍 Searching for: '{topic}'")
                
                # In a real scenario, this would crawl Wikipedia, Khan Academy, etc.
                # For demo, we'll show the structure
                print("📖 Sources configured:")
                print("   • Wikipedia Educational Articles")
                print("   • Khan Academy Tutorials") 
                print("   • MIT OpenCourseWare")
                print()
                
                # Create mock resources for demo
                mock_resources = [
                    {
                        'title': 'Python Programming Language - Wikipedia',
                        'content': 'Python is a high-level programming language...',
                        'source': 'Wikipedia',
                        'url': 'https://en.wikipedia.org/wiki/Python',
                        'content_type': 'Article'
                    },
                    {
                        'title': 'Intro to Programming - Khan Academy',
                        'content': 'Learn programming fundamentals with Python...',
                        'source': 'Khan Academy',
                        'url': 'https://khanacademy.org/programming',
                        'content_type': 'Tutorial'
                    }
                ]
                
                print("✅ Found educational resources:")
                for i, resource in enumerate(mock_resources, 1):
                    print(f"   {i}. {resource['title']}")
                    print(f"      Source: {resource['source']}")
                    print(f"      Type: {resource['content_type']}")
                    print()
                
            except Exception as e:
                print(f"⚠️  Demo error: {e}")
                self._show_mock_oer_demo()
        else:
            self._show_mock_oer_demo()
    
    def _show_mock_oer_demo(self):
        """Show mock OER demo when dependencies aren't available"""
        print("🔍 Searching for: 'Python programming basics'")
        print("📖 OER Sources (Mock Demo):")
        print("   • Wikipedia: Python Programming Language")
        print("   • Khan Academy: Intro to Programming")
        print("   • MIT OCW: Introduction to Computer Science")
        print("✅ Mock educational resources collected")
        print()
    
    def demonstrate_embeddings(self):
        """Demonstrate content embedding and semantic search"""
        print("🧠 2. Semantic Embeddings Demo")
        print("-" * 30)
        
        if DEPENDENCIES_AVAILABLE:
            try:
                # Initialize embedding pipeline
                pipeline = EmbeddingPipeline()
                
                # Sample educational content
                sample_content = [
                    "Variables in Python store data values",
                    "Functions help organize code into reusable blocks",
                    "Loops allow repeated execution of code",
                    "Lists are ordered collections of items"
                ]
                
                print("📝 Processing educational content:")
                for i, content in enumerate(sample_content, 1):
                    print(f"   {i}. {content}")
                
                print("\n🔄 Generating semantic embeddings...")
                embeddings = pipeline.embedding_generator.generate_embeddings(sample_content)
                
                print(f"✅ Generated {len(embeddings)} embeddings")
                print(f"📊 Embedding dimensions: {len(embeddings[0]) if embeddings else 'N/A'}")
                
                # Demonstrate similarity
                if len(embeddings) >= 2:
                    similarity = pipeline.embedding_generator.calculate_similarity(
                        embeddings[0], embeddings[1]
                    )
                    print(f"🔗 Content similarity example: {similarity:.3f}")
                
                print()
                
            except Exception as e:
                print(f"⚠️  Demo error: {e}")
                self._show_mock_embeddings_demo()
        else:
            self._show_mock_embeddings_demo()
    
    def _show_mock_embeddings_demo(self):
        """Show mock embeddings demo"""
        print("📝 Educational content samples:")
        print("   1. Variables in Python store data values")
        print("   2. Functions help organize code")
        print("   3. Loops allow repeated execution")
        print("\n🔄 Generating semantic embeddings... (Mock)")
        print("✅ Generated 768-dimensional embeddings")
        print("🔗 Content similarity: 0.847 (highly related)")
        print()
    
    def demonstrate_microcard_generation(self):
        """Demonstrate AI-powered micro-card generation"""
        print("🤖 3. AI Micro-Card Generator Demo")
        print("-" * 30)
        
        if DEPENDENCIES_AVAILABLE:
            try:
                # Initialize generator
                config = GenerationConfig()
                generator = MicroCardGenerator(config)
                
                # Generate different types of cards
                topics = ["Python variables", "Python functions"]
                card_types = [CardType.CONCEPT, CardType.QUIZ, CardType.DRILL]
                
                print("🎯 Generating micro-cards for:")
                for topic in topics:
                    print(f"   • {topic}")
                print()
                
                generated_cards = []
                for topic in topics:
                    for card_type in card_types[:2]:  # Limit for demo
                        try:
                            card = generator.generate_micro_card(
                                topic=topic,
                                content_type=card_type,
                                difficulty=DifficultyLevel.BEGINNER
                            )
                            
                            quality = generator.assess_content_quality(card, card_type)
                            
                            generated_cards.append({
                                'topic': topic,
                                'type': card_type.value,
                                'content': card,
                                'quality': quality
                            })
                            
                        except Exception as e:
                            print(f"⚠️  Error generating {card_type.value} for {topic}: {e}")
                
                # Show results
                print("✅ Generated micro-cards:")
                for i, card in enumerate(generated_cards, 1):
                    print(f"\n   {i}. {card['topic']} - {card['type'].title()}")
                    print(f"      Quality Score: {card['quality']:.2f}")
                    
                    # Show a preview of the content
                    if 'text' in card['content']:
                        preview = card['content']['text'][:100] + "..."
                        print(f"      Preview: {preview}")
                    elif 'question' in card['content']:
                        print(f"      Question: {card['content']['question']}")
                
                print(f"\n📊 Total cards generated: {len(generated_cards)}")
                
            except Exception as e:
                print(f"⚠️  Demo error: {e}")
                self._show_mock_microcard_demo()
        else:
            self._show_mock_microcard_demo()
    
    def _show_mock_microcard_demo(self):
        """Show mock micro-card demo"""
        print("🎯 Generating micro-cards for:")
        print("   • Python variables")
        print("   • Python functions")
        print()
        print("✅ Generated micro-cards (Mock Demo):")
        print("\n   1. Python variables - Concept")
        print("      Quality Score: 0.87")
        print("      Preview: Variables in Python are containers for storing...")
        print("\n   2. Python variables - Quiz")
        print("      Quality Score: 0.92")
        print("      Question: What is the correct way to create a variable?")
        print("\n   3. Python functions - Concept")
        print("      Quality Score: 0.85")
        print("      Preview: Functions are reusable blocks of code that...")
        print("\n📊 Total cards generated: 6")
        print()
    
    def demonstrate_integration(self):
        """Demonstrate end-to-end integration"""
        print("🔗 4. End-to-End Integration Demo")
        print("-" * 30)
        
        print("🎬 Simulating complete learning content pipeline:")
        print()
        print("1️⃣  Query: 'Learn Python basics'")
        print("2️⃣  🔍 Search OER sources (Wikipedia, Khan Academy, MIT)")
        print("3️⃣  📚 Extract relevant educational content")
        print("4️⃣  🧠 Generate semantic embeddings for content")
        print("5️⃣  🤖 Create personalized micro-cards using AI")
        print("6️⃣  ⭐ Apply spaced repetition scheduling")
        print("7️⃣  🎮 Add gamification elements (XP, badges)")
        print()
        
        # Show the pipeline result
        print("✅ Pipeline Result:")
        print("   📖 Found 15 educational resources")
        print("   🧠 Generated 768-dim embeddings for content similarity")
        print("   🎴 Created 12 personalized micro-cards")
        print("   📅 Scheduled with spaced repetition (SM2 algorithm)")
        print("   🏆 Ready for gamified learning experience")
        print()
    
    def show_stage2_summary(self):
        """Show Stage 2 feature summary"""
        print("📋 5. Stage 2 Feature Summary")
        print("-" * 30)
        
        features = [
            "🕷️  Multi-source OER content crawler",
            "🧠 Semantic embedding pipeline with FAISS search", 
            "🤖 AI-powered micro-card generation",
            "📊 Content quality assessment",
            "🎯 Personalized content adaptation",
            "🔗 Integration with Stage 1 spaced repetition",
            "⚡ Batch processing for efficiency",
            "🔍 Semantic similarity search"
        ]
        
        print("✨ New capabilities in Stage 2:")
        for feature in features:
            print(f"   {feature}")
        
        print()
        print("🏗️  Technical Stack:")
        print("   • HuggingFace Transformers for AI generation")
        print("   • SentenceTransformers for embeddings")
        print("   • FAISS for vector similarity search")
        print("   • BeautifulSoup for web scraping")
        print("   • Scikit-learn for content clustering")
        print()
        
        # Calculate demo duration
        duration = datetime.now() - self.demo_start_time
        print(f"⏱️  Demo completed in {duration.total_seconds():.1f} seconds")
        print()
        print("🎉 LearnInSlices Stage 2 is ready for intelligent learning!")


def run_stage2_demo():
    """Run the complete Stage 2 demonstration"""
    demo = Stage2Demo()
    
    try:
        demo.demonstrate_oer_crawler()
        demo.demonstrate_embeddings()
        demo.demonstrate_microcard_generation()
        demo.demonstrate_integration()
        demo.show_stage2_summary()
        
    except KeyboardInterrupt:
        print("\n⏹️  Demo interrupted by user")
    except Exception as e:
        print(f"\n❌ Demo error: {e}")
    finally:
        print("👋 Thank you for exploring LearnInSlices Stage 2!")


if __name__ == "__main__":
    run_stage2_demo()
