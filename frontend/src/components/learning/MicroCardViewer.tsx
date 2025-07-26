import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, BookmarkIcon, HeartIcon, CheckCircleIcon, PlayIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Card, Button } from '../ui';
import { useLearningStore } from '../../store';
import { useProgressStore } from '../../store';
import type { MicroCard, CardInteraction } from '../../types';

interface MicroCardViewerProps {
  pathId: string;
  cards: MicroCard[];
  currentCardIndex?: number;
  onComplete?: () => void;
  onCardChange?: (index: number) => void;
}

export const MicroCardViewer: React.FC<MicroCardViewerProps> = ({
  pathId,
  cards,
  currentCardIndex = 0,
  onComplete,
  onCardChange,
}) => {
  const { recordInteraction, markCardAsComplete, updateProgress } = useLearningStore();
  const { 
    startSession, 
    endSession, 
    updateCardProgress, 
    updatePathProgress
  } = useProgressStore();
  const [currentIndex, setCurrentIndex] = useState(currentCardIndex);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionCards, setSessionCards] = useState<string[]>([]);
  const [sessionAnswers, setSessionAnswers] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  
  // Animation and swipe states
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Video state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  
  // Touch and mouse handlers
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;
  const isFirstCard = currentIndex === 0;

  // Initialize session when component mounts
  useEffect(() => {
    startSession(pathId);
    updatePathProgress(pathId, { last_accessed: new Date().toISOString() });
  }, [pathId, startSession, updatePathProgress]);

  useEffect(() => {
    // Reset state when card changes
    setShowContent(false);
    setStartTime(Date.now());
    setTimeSpent(0);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setQuizCorrect(null);
    setDragX(0);
    setSwipeDirection(null);
    onCardChange?.(currentIndex);

    // Load card interaction state (bookmarks, likes)
    // This would come from the backend/store in a real app
    setIsBookmarked(false);
    setIsLiked(false);

    // Show quiz after every 3 content cards
    if (currentCard?.content.quiz && (currentIndex + 1) % 3 === 0) {
      setTimeout(() => setShowQuiz(true), 1000);
    }
  }, [currentIndex, onCardChange, currentCard]);

  useEffect(() => {
    // Track time spent on card
    const interval = setInterval(() => {
      setTimeSpent(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setIsDragging(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startX.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX.current;
    const deltaY = currentY - startY.current;
    
    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
      setIsDragging(true);
      setDragX(deltaX);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const threshold = 100; // Minimum distance for swipe
    
    if (Math.abs(dragX) > threshold) {
      if (dragX > 0 && !isFirstCard) {
        // Swipe right - previous card
        animateCardChange('right', () => handlePrevious());
      } else if (dragX < 0 && !isLastCard) {
        // Swipe left - next card
        animateCardChange('left', () => handleNext());
      }
    }
    
    // Reset drag state
    setDragX(0);
    setIsDragging(false);
    startX.current = 0;
    startY.current = 0;
  }, [isDragging, dragX, isFirstCard, isLastCard]);

  // Mouse handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!startX.current || e.buttons !== 1) return;
    
    const deltaX = e.clientX - startX.current;
    
    if (Math.abs(deltaX) > 10) {
      setIsDragging(true);
      setDragX(deltaX);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    const threshold = 100;
    
    if (Math.abs(dragX) > threshold) {
      if (dragX > 0 && !isFirstCard) {
        animateCardChange('right', () => handlePrevious());
      } else if (dragX < 0 && !isLastCard) {
        animateCardChange('left', () => handleNext());
      }
    }
    
    setDragX(0);
    setIsDragging(false);
    startX.current = 0;
  }, [isDragging, dragX, isFirstCard, isLastCard]);

  const animateCardChange = useCallback((direction: 'left' | 'right', callback: () => void) => {
    setIsAnimating(true);
    setSwipeDirection(direction);
    
    setTimeout(() => {
      callback();
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 300);
  }, []);

  const handlePrevious = () => {
    if (!isFirstCard) {
      recordCardInteraction('navigation_previous');
      animateCardChange('right', () => setCurrentIndex(prev => prev - 1));
    }
  };

  const handleNext = () => {
    // Record card completion with progress tracking
    const cardTimeSpent = Math.round((Date.now() - startTime) / 1000); // seconds
    
    // Update card progress
    updateCardProgress(pathId, currentCard.id, {
      status: 'mastered',
      attempts: 1,
      correct_answers: 1, // Assume correct for now
      time_spent: cardTimeSpent,
      confidence_level: 4 // Default confidence
    });

    // Track session data
    setSessionCards(prev => [...prev, currentCard.id]);
    setSessionAnswers(prev => ({ 
      correct: prev.correct + 1, 
      total: prev.total + 1 
    }));

    if (!isLastCard) {
      recordCardInteraction('navigation_next');
      animateCardChange('left', () => setCurrentIndex(prev => prev + 1));
    } else {
      // Last card - complete the session
      handleComplete();
    }
  };

  const handleComplete = () => {
    recordCardInteraction('card_completed');
    markCardAsComplete(pathId, currentCard.id);
    updateProgress(pathId, currentIndex + 1, cards.length);
    
    // End the progress tracking session
    const accuracy = sessionAnswers.total > 0 ? (sessionAnswers.correct / sessionAnswers.total) * 100 : 100;
    endSession(accuracy, [...sessionCards, currentCard.id]);
    
    onComplete?.();
  };

  const handleRevealContent = () => {
    setShowContent(true);
    recordCardInteraction('content_revealed');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    recordCardInteraction(isBookmarked ? 'bookmark_removed' : 'bookmark_added');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    recordCardInteraction(isLiked ? 'like_removed' : 'like_added');
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const submitQuiz = () => {
    if (selectedAnswer === null || !currentCard.content.quiz) return;
    
    const isCorrect = selectedAnswer === currentCard.content.quiz.correctAnswer;
    setQuizCorrect(isCorrect);
    setQuizSubmitted(true);
    
    // Update session stats
    setSessionAnswers(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    // Record interaction
    recordCardInteraction('quiz_completed');
    
    // Auto-advance after showing result
    setTimeout(() => {
      setShowQuiz(false);
      handleNext();
    }, 2000);
  };

  const toggleVideoPlay = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const recordCardInteraction = (type: CardInteraction['type']) => {
    recordInteraction({
      cardId: currentCard.id,
      pathId,
      type,
      timeSpent: Math.round(timeSpent / 1000),
      timestamp: new Date().toISOString(),
    });
  };

  if (!currentCard) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No cards available</p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card Counter */}
      <div className="text-center text-sm text-gray-600">
        Card {currentIndex + 1} of {cards.length}
      </div>

      {/* Main Card */}
      <div className="relative overflow-hidden">
        <Card 
          ref={cardRef}
          className={`relative transition-all duration-300 select-none ${
            isAnimating ? 'pointer-events-none' : ''
          }`}
          style={{
            transform: `translateX(${dragX}px) ${
              swipeDirection === 'left' ? 'translateX(-100%)' : 
              swipeDirection === 'right' ? 'translateX(100%)' : ''
            }`,
            opacity: isAnimating ? 0 : Math.max(0.5, 1 - Math.abs(dragX) / 200)
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {currentCard.type}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {currentCard.difficulty}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBookmark}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark card'}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <BookmarkIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            <button
              onClick={handleLike}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={isLiked ? 'Remove like' : 'Like card'}
            >
              {isLiked ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="space-y-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900">
            {currentCard.title}
          </h2>

          {/* Question/Prompt */}
          {currentCard.content.question && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 font-medium">
                {currentCard.content.question}
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            {currentCard.content.text && (
              <div className="text-gray-700 leading-relaxed">
                {currentCard.content.text}
              </div>
            )}

            {/* Interactive Content Reveal */}
            {currentCard.content.hiddenContent && (
              <div className="mt-4">
                {!showContent ? (
                  <Button
                    onClick={handleRevealContent}
                    variant="outline"
                    className="w-full"
                  >
                    Reveal Answer / More Content
                  </Button>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                    <div className="text-green-900">
                      {currentCard.content.hiddenContent}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Media Content */}
            {currentCard.content.imageUrl && (
              <div className="mt-6">
                <img 
                  src={currentCard.content.imageUrl} 
                  alt={currentCard.title}
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
            )}

            {/* Code Snippets */}
            {currentCard.content.codeSnippet && (
              <div className="mt-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{currentCard.content.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Key Points */}
            {currentCard.content.keyPoints && currentCard.content.keyPoints.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Key Points:</h4>
                <ul className="space-y-2">
                  {currentCard.content.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Video Content */}
            {currentCard.content.videoUrl && (
              <div className="mt-6">
                <div className="relative w-full rounded-lg overflow-hidden shadow-lg">
                  <video
                    className="w-full h-auto"
                    poster={currentCard.content.videoPoster}
                    controls
                    preload="metadata"
                    onPlay={() => {
                      setIsVideoPlaying(true);
                      recordCardInteraction('video_played');
                    }}
                    onPause={() => {
                      setIsVideoPlaying(false);
                      recordCardInteraction('video_paused');
                    }}
                  >
                    <source src={currentCard.content.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Video Play Button Overlay */}
                  {!isVideoPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <button
                        onClick={toggleVideoPlay}
                        className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                      >
                        <PlayIcon className="w-8 h-8 text-gray-800 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-600 text-center">
                  📹 Interactive video content - Learn by watching
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Modal Overlay */}
        {showQuiz && currentCard.content.quiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🧠 Quick Knowledge Check
                </h3>
                <p className="text-gray-600">
                  Test your understanding before moving forward
                </p>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Question:</h4>
                  <p className="text-blue-800">{currentCard.content.quiz.question}</p>
                </div>

                <div className="space-y-3">
                  {currentCard.content.quiz.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index)}
                      disabled={quizSubmitted}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        selectedAnswer === index
                          ? quizSubmitted
                            ? index === currentCard.content.quiz!.correctAnswer
                              ? 'border-green-500 bg-green-50 text-green-900'
                              : 'border-red-500 bg-red-50 text-red-900'
                            : 'border-blue-500 bg-blue-50 text-blue-900'
                          : quizSubmitted && index === currentCard.content.quiz!.correctAnswer
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === index
                            ? 'border-current'
                            : 'border-gray-300'
                        }`}>
                          {selectedAnswer === index && (
                            <div className="w-3 h-3 rounded-full bg-current"></div>
                          )}
                        </div>
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {!quizSubmitted ? (
                  <Button
                    onClick={submitQuiz}
                    disabled={selectedAnswer === null}
                    className="w-full py-3"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <div className="text-center space-y-4">
                    <div className={`text-lg font-bold ${
                      quizCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {quizCorrect ? '🎉 Correct!' : '❌ Not quite right'}
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        <strong>Explanation:</strong> {currentCard.content.quiz.explanation}
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Advancing to next card automatically...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Card Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Time on card: {Math.round(timeSpent / 1000)}s
            </div>
            
            <div className="text-sm text-gray-500">
              Estimated time: {currentCard.estimatedTime || '2 min'}
            </div>
          </div>
        </div>
      </Card>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={isFirstCard}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-3">
          {/* Quick Navigation Dots */}
          <div className="flex space-x-1">
            {cards.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
              const actualIndex = Math.max(0, currentIndex - 2) + index;
              return (
                <button
                  key={actualIndex}
                  onClick={() => setCurrentIndex(actualIndex)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    actualIndex === currentIndex 
                      ? 'bg-primary-600' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  title={`Go to card ${actualIndex + 1}`}
                />
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleNext}
          className="flex items-center space-x-2"
        >
          <span>{isLastCard ? 'Complete' : 'Next'}</span>
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <span>Press ← → to navigate</span>
        <span>•</span>
        <span>Space to reveal content</span>
      </div>
    </div>
  );
};

export default MicroCardViewer;
