"""
AI-Powered Micro-Card Generator
Generates personalized microlearning content using HuggingFace models

Key Features:
- Multiple content types (concept, quiz, drill, interactive)
- Enhanced video integration and playlist generation
- Advanced quiz systems with streak tracking
- Difficulty level adaptation with swipe gesture analytics
- Quality assessment and validation
- Content personalization based on learning history
- Integration with OER content for source material
- Swipe animation and gesture support
"""

import random
from typing import List, Dict, Optional, Union
from dataclasses import dataclass
from datetime import datetime, timezone
import logging
import json

from transformers import pipeline
import torch

from ..ml.oercrawler import OERResource
from ..ml.embeddings import EmbeddingGenerator
from ..app.models import CardType, DifficultyLevel


@dataclass
class GenerationConfig:
    """Configuration for micro-card generation"""

    model_name: str = "microsoft/DialoGPT-medium"  # Free model
    max_length: int = 512
    temperature: float = 0.7
    top_p: float = 0.9
    num_return_sequences: int = 1
    device: str = "auto"


class ContentTemplates:
    """
    Templates for different types of micro-cards
    """

    CONCEPT_TEMPLATE = """
    Create an educational concept explanation about: {topic}

    Difficulty level: {difficulty}
    Target audience: {audience}

    Please provide:
    1. A clear, concise explanation (2-3 sentences)
    2. 2-3 practical examples
    3. Key points to remember

    Format your response as structured explanation for microlearning.
    """

    QUIZ_TEMPLATE = """
    Create a multiple-choice quiz question about: {topic}

    Difficulty level: {difficulty}

    Please provide:
    1. A clear question
    2. 4 multiple choice options (A, B, C, D)
    3. The correct answer
    4. A brief explanation of why the answer is correct

    Make the question challenging but fair for {difficulty} level.
    """

    DRILL_TEMPLATE = """
    Create a practice exercise about: {topic}

    Difficulty level: {difficulty}

    Please provide:
    1. Clear instructions for the exercise
    2. 3-5 practice problems or tasks
    3. Brief guidance on how to approach the problems

    Focus on practical application and skill-building.
    """

    INTERACTIVE_TEMPLATE = """
    Design an interactive learning activity about: {topic}

    Difficulty level: {difficulty}

    Please provide:
    1. Activity description and objectives
    2. Step-by-step interactive elements
    3. Expected outcomes or deliverables

    Make it engaging and hands-on for effective learning.
    """


class MicroCardGenerator:
    """
    Generates micro-cards using AI language models
    """

    def __init__(self, config: GenerationConfig = None):
        """
        Initialize the micro-card generator

        Args:
            config: Generation configuration
        """
        self.config = config or GenerationConfig()
        self.device = self._get_device()
        self.model = None
        self.tokenizer = None
        self.text_generator = None

        # Initialize models
        self._load_models()

        # Content templates
        self.templates = ContentTemplates()

        # Embedding generator for content similarity
        self.embedding_generator = EmbeddingGenerator()

        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def _get_device(self) -> str:
        """Determine the best device to use"""
        if self.config.device == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        return self.config.device

    def _load_models(self):
        """Load the AI models for content generation"""
        try:
            self.logger.info(f"Loading model: {self.config.model_name}")

            # For simplicity, we'll use a text generation pipeline
            # In production, you might want more control over the model
            self.text_generator = pipeline(
                "text-generation",
                model=self.config.model_name,
                device=0 if self.device == "cuda" else -1,
                torch_dtype=(
                    torch.float16 if self.device == "cuda" else torch.float32
                ),
            )

            self.logger.info("Models loaded successfully")

        except Exception as e:
            self.logger.error(f"Error loading models: {e}")
            # Fallback to a simpler approach
            self.text_generator = None
            self.logger.warning("Using fallback content generation")

    def generate_micro_card(
        self,
        topic: str,
        content_type: CardType,
        difficulty: DifficultyLevel,
        source_material: Optional[OERResource] = None,
        user_context: Optional[Dict] = None,
    ) -> Dict:
        """
        Generate a micro-card for a specific topic and type

        Args:
            topic: Learning topic
            content_type: Type of micro-card to generate
            difficulty: Difficulty level
            source_material: Optional OER source material
        user_context: Optional user learning context

        Returns:
        Generated micro-card content dictionary
        """
        self.logger.info(
            f"Generating {content_type.value} card for " f"topic: {topic}"
        )

        # Prepare context
        context = {
            "topic": topic,
            "difficulty": difficulty.value,
            "audience": self._get_audience_description(difficulty),
            "source_material": (
                source_material.content if source_material else None
            ),
        }

        # Generate content based on type
        if content_type == CardType.CONCEPT:
            return self._generate_concept_card(context, source_material)
        elif content_type == CardType.QUIZ:
            return self._generate_quiz_card(context, source_material)
        elif content_type == CardType.DRILL:
            return self._generate_drill_card(context, source_material)
        elif content_type == CardType.INTERACTIVE:
            return self._generate_interactive_card(context, source_material)
        else:
            return self._generate_fallback_card(context)

    def _get_template(self, content_type: CardType) -> str:
        """Get the appropriate template for content type"""
        template_map = {
            CardType.CONCEPT: self.templates.CONCEPT_TEMPLATE,
            CardType.QUIZ: self.templates.QUIZ_TEMPLATE,
            CardType.DRILL: self.templates.DRILL_TEMPLATE,
            CardType.INTERACTIVE: self.templates.INTERACTIVE_TEMPLATE,
        }
        return template_map.get(content_type, self.templates.CONCEPT_TEMPLATE)

    def _get_audience_description(self, difficulty: DifficultyLevel) -> str:
        """Get audience description based on difficulty level"""
        descriptions = {
            DifficultyLevel.BEGINNER: "beginners with no prior knowledge",
            DifficultyLevel.INTERMEDIATE: "learners with basic understanding",
            DifficultyLevel.ADVANCED: "experienced learners seeking depth",
        }
        return descriptions.get(difficulty, "general learners")

    def _generate_concept_card(
        self, context: Dict, source_material: Optional[OERResource]
    ) -> Dict:
        """Generate a concept explanation card"""
        if source_material and source_material.content:
            # Extract key concepts from source material
            text_content = self._extract_key_concepts(
                source_material.content, context["topic"]
            )
            examples = self._generate_examples(
                context["topic"], context["difficulty"]
            )
        else:
            # Generate from scratch using AI or templates
            text_content = self._generate_explanation(
                context["topic"], context["difficulty"]
            )
            examples = self._generate_examples(
                context["topic"], context["difficulty"]
            )

        return {
            "text": text_content,
            "examples": examples,
            "key_points": self._extract_key_points(text_content),
        }

    def _generate_quiz_card(
        self, context: Dict, source_material: Optional[OERResource]
    ) -> Dict:
        """Generate a quiz card with multiple choice questions"""
        question = self._generate_question(
            context["topic"], context["difficulty"]
        )
        options = self._generate_options(context["topic"], question)
        correct_answer = options[0]  # First option is correct by design
        random.shuffle(options)  # Shuffle to randomize correct position

        return {
            "question": question,
            "options": options,
            "correct_answer": correct_answer,
            "explanation": self._generate_explanation_for_answer(
                question, correct_answer
            ),
        }

    def _generate_drill_card(
        self, context: Dict, source_material: Optional[OERResource]
    ) -> Dict:
        """Generate a practice drill card"""
        instructions = self._generate_drill_instructions(
            context["topic"], context["difficulty"]
        )
        exercises = self._generate_practice_exercises(
            context["topic"], context["difficulty"]
        )

        return {
            "instructions": instructions,
            "exercises": exercises,
            "guidance": self._generate_guidance(context["topic"]),
        }

    def _generate_interactive_card(
        self, context: Dict, source_material: Optional[OERResource]
    ) -> Dict:
        """Generate an interactive activity card"""
        description = self._generate_activity_description(
            context["topic"], context["difficulty"]
        )
        elements = self._generate_interactive_elements(context["topic"])

        return {
            "description": description,
            "interactive_elements": elements,
            "objectives": self._generate_learning_objectives(context["topic"]),
        }

    def _generate_fallback_card(self, context: Dict) -> Dict:
        """Generate a basic fallback card when AI generation fails"""
        return {
            "text": f"Learn about {
                context['topic']} at {
                context['difficulty']} level.",
            "examples": [
                f"Example 1: Basic {
                    context['topic']} concept",
                f"Example 2: Practical {
                    context['topic']} application",
            ],
            "key_points": [
                f"Key point about {
                    context['topic']}",
                f"Important aspect of {
                    context['topic']}",
            ],
        }

    def _extract_key_concepts(self, source_content: str, topic: str) -> str:
        """Extract key concepts from source material"""
        # Simple extraction - in production, use more sophisticated NLP
        sentences = source_content.split(".")
        relevant_sentences = [
            s.strip()
            for s in sentences
            if topic.lower() in s.lower() and len(s.strip()) > 20
        ]

        if relevant_sentences:
            # Take first 2-3 most relevant sentences
            return ". ".join(relevant_sentences[:3]) + "."
        else:
            return f"This topic covers important concepts related to {topic}."

    def _generate_explanation(self, topic: str, difficulty: str) -> str:
        """Generate explanation text for a topic"""
        if self.text_generator:
            try:
                prompt = f"Explain {topic} for {difficulty} level learners:"
                result = self.text_generator(
                    prompt,
                    max_length=self.config.max_length,
                    temperature=self.config.temperature,
                    pad_token_id=self.text_generator.tokenizer.eos_token_id,
                )
                generated_text = result[0]["generated_text"]
                # Clean up the generated text
                explanation = generated_text.replace(prompt, "").strip()
                return explanation[:500]  # Limit length
            except Exception as e:
                self.logger.error(f"Error in AI generation: {e}")

        # Fallback explanation
        return f"{topic} is an important concept that involves understanding key principles and applications. This knowledge forms the foundation for more advanced learning in this area."

    def _generate_examples(self, topic: str, difficulty: str) -> List[str]:
        """Generate examples for a topic"""
        # Template-based example generation
        examples = []

        if "python" in topic.lower() or "programming" in topic.lower():
            examples = [
                "x = 10  # Variable assignment",
                "print('Hello, World!')  # Output statement",
                "if x > 5: print('Greater')  # Conditional statement",
            ]
        elif "math" in topic.lower() or "algebra" in topic.lower():
            examples = [
                "2x + 3 = 7, so x = 2",
                "Area of circle = πr²",
                "Slope = (y₂ - y₁) / (x₂ - x₁)",
            ]
        else:
            examples = [
                f"Basic example of {topic}",
                f"Practical application of {topic}",
                f"Advanced use case for {topic}",
            ]

        return examples[:3]  # Limit to 3 examples

    def _extract_key_points(self, text: str) -> List[str]:
        """Extract key points from text"""
        sentences = text.split(".")
        # Simple heuristic: shorter sentences are often key points
        key_points = [
            s.strip() for s in sentences if 10 < len(s.strip()) < 100
        ]
        return key_points[:3]  # Limit to 3 key points

    def _generate_question(self, topic: str, difficulty: str) -> str:
        """Generate a quiz question"""
        question_starters = [
            "What is the main purpose of",
            "Which of the following best describes",
            "How does",
            "What happens when",
            "Which statement about",
        ]

        starter = random.choice(question_starters)
        return f"{starter} {topic}?"

    def _generate_options(self, topic: str, question: str) -> List[str]:
        """Generate multiple choice options"""
        # Template-based option generation
        correct_option = f"The correct understanding of {topic}"

        incorrect_options = [
            f"A common misconception about {topic}",
            f"An unrelated concept to {topic}",
            f"An oversimplified view of {topic}",
        ]

        return [correct_option] + incorrect_options

    def _generate_explanation_for_answer(
        self, question: str, answer: str
    ) -> str:
        """Generate explanation for quiz answer"""
        return f"This is correct because it accurately represents the core concept being tested in the question."

    def _generate_drill_instructions(self, topic: str, difficulty: str) -> str:
        """Generate instructions for practice drills"""
        return f"Practice these {topic} exercises to reinforce your understanding. Work through each problem step by step."

    def _generate_practice_exercises(
        self, topic: str, difficulty: str
    ) -> List[str]:
        """Generate practice exercises"""
        if "python" in topic.lower():
            exercises = [
                "Write a function that returns the square of a number",
                "Create a list of even numbers from 1 to 10",
                "Use a loop to print numbers from 1 to 5",
            ]
        elif "math" in topic.lower():
            exercises = [
                "Solve: 3x + 7 = 16",
                "Find the area of a rectangle with length 8 and width 5",
                "Calculate the percentage: 25 out of 200",
            ]
        else:
            exercises = [
                f"Apply the principles of {topic} to solve a simple problem",
                f"Identify key components in a {topic} scenario",
                f"Explain how {topic} works in your own words",
            ]

        return exercises

    def _generate_guidance(self, topic: str) -> str:
        """Generate guidance for exercises"""
        return f"When working with {topic}, remember to break down complex problems into smaller steps and verify your understanding."

    def _generate_activity_description(
        self, topic: str, difficulty: str
    ) -> str:
        """Generate description for interactive activities"""
        return f"Engage with {topic} through hands-on activities designed for {difficulty} level learners."

    def _generate_interactive_elements(self, topic: str) -> List[Dict]:
        """Generate interactive elements for activities"""
        return [
            {
                "type": "text_input",
                "prompt": f"Enter your understanding of {topic}",
            },
            {
                "type": "multiple_choice",
                "question": f"Which best describes {topic}?",
            },
            {
                "type": "drag_drop",
                "instruction": f"Match {topic} concepts with examples",
            },
        ]

    def _generate_learning_objectives(self, topic: str) -> List[str]:
        """Generate learning objectives"""
        return [
            f"Understand the core concepts of {topic}",
            f"Apply {topic} principles to practical scenarios",
            f"Identify key relationships within {topic}",
        ]

    def assess_content_quality(
        self, content: Dict, content_type: CardType
    ) -> float:
        """
        Assess the quality of generated content

        Args:
        content: Generated content dictionary
        content_type: Type of content

        Returns:
        Quality score (0.0 to 1.0)
        """
        score = 0.0

        # Check content completeness
        required_fields = self._get_required_fields(content_type)
        completeness_score = sum(
            1 for field in required_fields if field in content
        ) / len(required_fields)
        score += completeness_score * 0.3

        # Check content length and substance
        if content_type == CardType.CONCEPT:
            text_content = content.get("text", "")
            if 50 <= len(text_content) <= 500:  # Good length range
                score += 0.2
            if content.get("examples") and len(content["examples"]) >= 2:
                score += 0.2

        elif content_type == CardType.QUIZ:
            question = content.get("question", "")
            options = content.get("options", [])
            if len(question) > 10 and len(options) == 4:
                score += 0.4

        # Check for educational value indicators
        text_to_check = str(content).lower()
        educational_keywords = [
            "learn",
            "understand",
            "concept",
            "example",
            "practice",
            "apply",
        ]
        keyword_score = sum(
            1 for keyword in educational_keywords if keyword in text_to_check
        )
        score += min(keyword_score / len(educational_keywords), 0.3)

        # Final score between 0 and 1
        return min(score, 1.0)

    def _get_required_fields(self, content_type: CardType) -> List[str]:
        """Get required fields for each content type"""
        field_map = {
            CardType.CONCEPT: ["text", "examples"],
            CardType.QUIZ: ["question", "options", "correct_answer"],
            CardType.DRILL: ["instructions", "exercises"],
            CardType.INTERACTIVE: ["description", "interactive_elements"],
        }
        return field_map.get(content_type, ["text"])

    def generate_batch_cards(
        self,
        topics: List[str],
        content_types: List[CardType],
        difficulty: DifficultyLevel,
        source_materials: Optional[List[OERResource]] = None,
    ) -> List[Dict]:
        """
        Generate multiple micro-cards efficiently

        Args:
        topics: List of topics to generate cards for
        content_types: List of content types to generate
        difficulty: Difficulty level
        source_materials: Optional list of source materials

        Returns:
        List of generated micro-card dictionaries
        """
        self.logger.info(f"Generating batch of {len(topics)} cards")

        generated_cards = []

        for i, topic in enumerate(topics):
            for content_type in content_types:
                source_material = None
                if source_materials and i < len(source_materials):
                    source_material = source_materials[i]

                try:
                    card_content = self.generate_micro_card(
                        topic=topic,
                        content_type=content_type,
                        difficulty=difficulty,
                        source_material=source_material,
                    )

                    # Assess quality
                    quality_score = self.assess_content_quality(
                        card_content, content_type
                    )

                    card_data = {
                        "title": f"{topic} - {content_type.value.title()}",
                        "content": card_content,
                        "content_type": content_type,
                        "difficulty_level": difficulty,
                        "quality_score": quality_score,
                        "generated_by_ai": True,
                        "generation_timestamp": datetime.now(
                            timezone.utc
                        ).isoformat(),
                    }

                    generated_cards.append(card_data)

                except Exception as e:
                    self.logger.error(
                        f"Error generating card for {topic}: {e}"
                    )
                    continue

        self.logger.info(
            f"Successfully generated {
                len(generated_cards)} cards"
        )
        return generated_cards


class EnhancedContentGenerator(MicroCardGenerator):
    """
    Enhanced version with video integration and advanced quiz systems
    """

    def generate_video_content(
        self,
        topic: str,
        skill_level: str,
        video_count: int = 2
    ) -> List[Dict]:
        """
        Generate video content metadata for a topic
        
        Args:
            topic: The topic for video content
            skill_level: beginner, intermediate, advanced
            video_count: Number of videos to generate
            
        Returns:
            List of video content dictionaries
        """
        videos = []
        
        video_types = [
            "introduction", "tutorial", "examples", "practice", "advanced"
        ]
        
        for i in range(video_count):
            video_type = video_types[i % len(video_types)]
            
            # Generate video metadata based on type and skill level
            video = {
                "id": f"v_{topic.lower().replace(' ', '_')}_{i+1}",
                "title": f"{topic} - {video_type.title()}",
                "description": self._generate_video_description(
                    topic, video_type, skill_level
                ),
                "thumbnail": f"https://via.placeholder.com/1280x720/"
                            f"{'3B82F6' if skill_level == 'beginner' else '8B5CF6' if skill_level == 'intermediate' else 'EC4899'}"
                            f"/FFFFFF?text={topic.replace(' ', '+')}+{video_type.title()}",
                "duration": self._estimate_video_duration(video_type),
                "skillLevel": skill_level,
                "tags": [topic.lower(), video_type, skill_level],
                "transcript": self._generate_video_transcript(
                    topic, video_type, skill_level
                )
            }
            videos.append(video)
            
        return videos

    def _generate_video_description(
        self, topic: str, video_type: str, skill_level: str
    ) -> str:
        """Generate description for video content"""
        descriptions = {
            "introduction": f"A comprehensive introduction to {topic} "
                          f"designed for {skill_level} learners",
            "tutorial": f"Step-by-step tutorial covering {topic} "
                       f"with practical examples",
            "examples": f"Real-world examples and applications of {topic}",
            "practice": f"Hands-on practice exercises for mastering {topic}",
            "advanced": f"Advanced concepts and patterns in {topic}"
        }
        return descriptions.get(video_type, f"Learn about {topic}")

    def _estimate_video_duration(self, video_type: str) -> int:
        """Estimate video duration in seconds based on type"""
        durations = {
            "introduction": 180,  # 3 minutes
            "tutorial": 300,      # 5 minutes
            "examples": 240,      # 4 minutes
            "practice": 420,      # 7 minutes
            "advanced": 360       # 6 minutes
        }
        return durations.get(video_type, 300)

    def _generate_video_transcript(
        self, topic: str, video_type: str, skill_level: str
    ) -> str:
        """Generate basic transcript for video content"""
        if video_type == "introduction":
            return (f"In this video, we'll explore {topic} and understand "
                    f"why it's important for {skill_level} developers...")
        elif video_type == "tutorial":
            return (f"Let's walk through {topic} step by step. "
                    f"We'll start with the basics and build up...")
        else:
            return (f"This video covers {topic} with focus on "
                    f"{video_type} for {skill_level} level.")

    def generate_enhanced_quiz(
        self,
        topic: str,
        difficulty: str,
        quiz_type: str = "multiple_choice"
    ) -> Dict:
        """
        Generate enhanced quiz with better feedback and explanations
        
        Args:
            topic: The quiz topic
            difficulty: easy, medium, hard
            quiz_type: Type of quiz to generate
            
        Returns:
            Enhanced quiz dictionary
        """
        base_quiz = self._generate_basic_quiz_content(topic, difficulty)
        
        # Enhance with additional features
        enhanced_quiz = {
            **base_quiz,
            "quiz_type": quiz_type,
            "difficulty": difficulty,
            "time_limit": self._get_time_limit(difficulty),
            "hints": self._generate_hints(topic, base_quiz["question"]),
            "detailed_explanation": self._generate_detailed_explanation(
                topic, base_quiz["question"], base_quiz["correct_answer"]
            ),
            "learning_objectives": [
                f"Understand {topic} concepts",
                f"Apply {topic} in practical scenarios"
            ],
            "tags": [topic.lower(), difficulty, quiz_type]
        }
        
        return enhanced_quiz

    def _generate_basic_quiz_content(self, topic: str, difficulty: str) -> Dict:
        """Generate basic quiz content"""
        # Enhanced question generation based on topic and difficulty
        if "react" in topic.lower():
            questions = {
                "easy": {
                    "question": f"What is the primary purpose of {topic}?",
                    "options": [
                        f"To make {topic} more complex",
                        f"To improve {topic} functionality",
                        f"To replace {topic} entirely",
                        f"To make {topic} obsolete"
                    ],
                    "correct_answer": 1
                },
                "medium": {
                    "question": f"How does {topic} handle data flow?",
                    "options": [
                        "Bidirectional data binding",
                        "Unidirectional data flow",
                        "No data flow management",
                        "Random data updates"
                    ],
                    "correct_answer": 1
                }
            }
        else:
            # Generic question template
            questions = {
                "easy": {
                    "question": f"Which statement best describes {topic}?",
                    "options": [
                        f"{topic} is a fundamental concept",
                        f"{topic} is not important",
                        f"{topic} should be avoided",
                        f"{topic} is outdated"
                    ],
                    "correct_answer": 0
                }
            }
        
        selected_question = questions.get(
            difficulty, questions.get("easy", questions["easy"])
        )
        
        return {
            **selected_question,
            "explanation": f"This concept is important because it forms "
                         f"the foundation of understanding {topic}."
        }

    def _get_time_limit(self, difficulty: str) -> int:
        """Get time limit in seconds based on difficulty"""
        time_limits = {
            "easy": 30,
            "medium": 45,
            "hard": 60
        }
        return time_limits.get(difficulty, 30)

    def _generate_hints(self, topic: str, question: str) -> List[str]:
        """Generate helpful hints for the question"""
        return [
            f"Think about the core purpose of {topic}",
            f"Consider how {topic} is typically used",
            f"Remember the key principles of {topic}"
        ]

    def _generate_detailed_explanation(
        self, topic: str, question: str, correct_answer: int
    ) -> str:
        """Generate detailed explanation for the correct answer"""
        return (f"The correct answer demonstrates a fundamental "
                f"understanding of {topic}. This concept is crucial "
                f"because it helps establish the proper mental model "
                f"for working with {topic} effectively.")

    def generate_swipe_analytics_data(
        self,
        user_id: str,
        card_id: str,
        swipe_direction: str,
        swipe_velocity: float,
        time_spent: int
    ) -> Dict:
        """
        Generate analytics data for swipe gestures
        
        Args:
            user_id: User identifier
            card_id: Card identifier
            swipe_direction: left, right, up, down
            swipe_velocity: Swipe velocity
            time_spent: Time spent on card in seconds
            
        Returns:
            Analytics data dictionary
        """
        return {
            "user_id": user_id,
            "card_id": card_id,
            "interaction_type": "swipe",
            "swipe_direction": swipe_direction,
            "swipe_velocity": swipe_velocity,
            "time_spent": time_spent,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "engagement_score": self._calculate_engagement_score(
                swipe_velocity, time_spent
            )
        }

    def _calculate_engagement_score(
        self, velocity: float, time_spent: int
    ) -> float:
        """Calculate engagement score based on interaction data"""
        # Higher velocity and appropriate time spent indicate engagement
        velocity_score = min(velocity * 10, 5.0)  # Cap at 5
        time_score = min(time_spent / 10, 5.0)    # Cap at 5
        return (velocity_score + time_score) / 2


class VideoContentCurator:
    """
    Curates and manages video content for learning cards
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def create_video_playlist(
        self,
        topic: str,
        skill_level: str,
        max_videos: int = 3
    ) -> List[Dict]:
        """
        Create a curated video playlist for a topic
        
        Args:
            topic: Learning topic
            skill_level: Learner's skill level
            max_videos: Maximum number of videos
            
        Returns:
            List of video metadata
        """
        playlist = []
        
        # Video progression for different skill levels
        video_progression = {
            "beginner": ["introduction", "basic_tutorial", "examples"],
            "intermediate": ["review", "advanced_tutorial", "practice"],
            "advanced": ["deep_dive", "case_studies", "expert_tips"]
        }
        
        video_types = video_progression.get(skill_level, ["introduction"])
        
        for i, video_type in enumerate(video_types[:max_videos]):
            video = {
                "id": f"playlist_{topic}_{skill_level}_{i+1}",
                "title": f"{topic} - {video_type.replace('_', ' ').title()}",
                "type": video_type,
                "order": i + 1,
                "skill_level": skill_level,
                "estimated_duration": self._get_duration_by_type(video_type),
                "learning_outcomes": self._get_learning_outcomes(
                    topic, video_type
                )
            }
            playlist.append(video)
            
        return playlist
    
    def _get_duration_by_type(self, video_type: str) -> int:
        """Get duration based on video type"""
        durations = {
            "introduction": 180,
            "basic_tutorial": 300,
            "examples": 240,
            "review": 150,
            "advanced_tutorial": 420,
            "practice": 360,
            "deep_dive": 480,
            "case_studies": 360,
            "expert_tips": 240
        }
        return durations.get(video_type, 300)
    
    def _get_learning_outcomes(self, topic: str, video_type: str) -> List[str]:
        """Define learning outcomes for video types"""
        if video_type == "introduction":
            return [f"Understand what {topic} is",
                   f"Learn why {topic} is important"]
        elif "tutorial" in video_type:
            return [f"Learn how to use {topic}",
                   f"Practice {topic} implementation"]
        else:
            return [f"Master {topic} concepts",
                   f"Apply {topic} in real scenarios"]


class ContentPersonalizer:
    """
    Personalizes micro-card content based on user learning history and preferences
    """

    def __init__(self, generator: MicroCardGenerator):
        """
        Initialize content personalizer

        Args:
        generator: MicroCardGenerator instance
        """
        self.generator = generator
        self.logger = logging.getLogger(__name__)

    def personalize_content(
        self,
        base_content: Dict,
        user_history: List[Dict],
        user_preferences: Dict,
    ) -> Dict:
        """
        Personalize content based on user data

        Args:
        base_content: Base generated content
        user_history: User's learning history
        user_preferences: User preferences

        Returns:
        Personalized content dictionary
        """
        personalized = base_content.copy()

        # Adjust difficulty based on user performance
        avg_performance = self._calculate_average_performance(user_history)
        if avg_performance > 0.8:  # High performer
            personalized = self._increase_difficulty(personalized)
        elif avg_performance < 0.5:  # Struggling learner
            personalized = self._decrease_difficulty(personalized)

        # Adapt content style based on preferences
        preferred_style = user_preferences.get("learning_style", "balanced")
        if preferred_style == "visual":
            personalized = self._add_visual_elements(personalized)
        elif preferred_style == "practical":
            personalized = self._emphasize_examples(personalized)

        return personalized

    def _calculate_average_performance(
        self, user_history: List[Dict]
    ) -> float:
        """Calculate user's average performance from history"""
        if not user_history:
            return 0.5  # Default average

        scores = [item.get("performance_score", 0.5) for item in user_history]
        return sum(scores) / len(scores)

    def _increase_difficulty(self, content: Dict) -> Dict:
        """Increase content difficulty"""
        # Add more complex examples or advanced concepts
        if "examples" in content:
            content["examples"].append("Advanced application scenario")
        return content

    def _decrease_difficulty(self, content: Dict) -> Dict:
        """Decrease content difficulty"""
        # Simplify language and add more basic examples
        if "text" in content:
            content["text"] = content["text"].replace("advanced", "basic")
        return content

    def _add_visual_elements(self, content: Dict) -> Dict:
        """Add visual learning elements"""
        content["visual_aids"] = ["Diagram suggestion", "Chart reference"]
        return content

    def _emphasize_examples(self, content: Dict) -> Dict:
        """Emphasize practical examples"""
        if "examples" in content and len(content["examples"]) < 5:
            content["examples"].append("Additional practical example")
        return content
