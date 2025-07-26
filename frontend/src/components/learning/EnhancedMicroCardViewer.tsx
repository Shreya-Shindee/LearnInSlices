import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  BookmarkIcon, 
  HeartIcon, 
  CheckCircleIcon, 
  AcademicCapIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Card, Button } from '../ui';
import { useLearningStore } from '../../store';
import { useProgressStore } from '../../store';
import type { MicroCard, CardInteraction, VideoContent } from '../../types';

interface EnhancedMicroCardViewerProps {
  pathId: string;
  cards: MicroCard[];
  currentCardIndex?: number;
  onComplete?: () => void;
  onCardChange?: (index: number) => void;
  quizInterval?: number; // Show quiz every N cards
  autoAdvanceVideos?: boolean;
  enableAudio?: boolean;
  enableNotes?: boolean;
}

export const EnhancedMicroCardViewer: React.FC<EnhancedMicroCardViewerProps> = ({
  pathId,
  cards,
  currentCardIndex = 0,
  onComplete,
  onCardChange,
  quizInterval = 3,
  autoAdvanceVideos = true,
  enableAudio = true,
  // enableNotes = true, // Temporarily disabled
}) => {
  const { recordInteraction, markCardAsComplete, updateProgress } = useLearningStore();
  const { 
    startSession, 
    endSession, 
    updateCardProgress, 
    updatePathProgress
  } = useProgressStore();

  // Core state
  const [currentIndex, setCurrentIndex] = useState(currentCardIndex);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [sessionCards, setSessionCards] = useState<string[]>([]);
  const [sessionAnswers, setSessionAnswers] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  
  // Enhanced features state
  const [isAudioEnabled] = useState(enableAudio);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [cardNotes, setCardNotes] = useState<string[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  // const [darkMode, setDarkMode] = useState(false);
  
  // Enhanced animation and swipe states
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Video state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showVideoPlaylist, setShowVideoPlaylist] = useState(false);
  
  // Enhanced quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [showQuizResults, setShowQuizResults] = useState(false);
  
  // Touch and gesture refs
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const gestureStartTime = useRef(Date.now());
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;
  const isFirstCard = currentIndex === 0;

  // Sample videos for current card (would come from API)
  const currentVideos: VideoContent[] = [
    {
      id: '1',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      title: `${currentCard?.title} - Video Tutorial`,
      description: 'Learn through visual examples and practical demonstrations',
      thumbnail: 'https://via.placeholder.com/320x180/8B5CF6/FFFFFF?text=Video+Tutorial',
      duration: 180,
      skillLevel: currentCard?.difficulty || 'beginner',
      tags: ['tutorial', 'interactive', currentCard?.type || 'concept']
    },
    {
      id: '2',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      title: `${currentCard?.title} - Advanced Examples`,
      description: 'Deep dive into advanced concepts and real-world applications',
      thumbnail: 'https://via.placeholder.com/320x180/10B981/FFFFFF?text=Advanced+Examples',
      duration: 240,
      skillLevel: 'intermediate',
      tags: ['advanced', 'examples', 'practical']
    }
  ];

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
    }
  }, []);

  // Enhanced text-to-speech functionality
  const speakText = useCallback((text: string) => {
    if (speechSynthesis.current && isAudioEnabled) {
      speechSynthesis.current.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.current.speak(utterance);
    }
  }, [isAudioEnabled]);

  const stopSpeaking = useCallback(() => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsPlaying(false);
    }
  }, []);

  // Initialize session
  useEffect(() => {
    startSession(pathId);
    updatePathProgress(pathId, { last_accessed: new Date().toISOString() });
  }, [pathId, startSession, updatePathProgress]);

  // Reset state when card changes
  useEffect(() => {
    setShowContent(false);
    setVideoProgress(0);
    setCurrentVideoIndex(0);
    setCardStartTime(Date.now());
    setTimeSpent(0);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setQuizCorrect(null);
    setCardFlipped(false);
    setConfidenceLevel(null);
    setNoteInput('');
    setShowNotes(false);
    setDragX(0);
    onCardChange?.(currentIndex);

    // Auto-show quiz after interval
    const shouldShowQuiz = currentCard?.content.quiz && 
                          (currentIndex + 1) % quizInterval === 0 && 
                          currentIndex > 0;
    
    if (shouldShowQuiz) {
      setTimeout(() => setShowQuiz(true), 2000);
    }
  }, [currentIndex, onCardChange, currentCard, quizInterval]);

  // Time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Date.now() - cardStartTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [cardStartTime]);

  // Enhanced touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    gestureStartTime.current = Date.now();
    setIsDragging(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startX.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX.current;
    const deltaY = currentY - startY.current;
    
    // Enhanced swipe detection with better threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 15) {
      e.preventDefault();
      setIsDragging(true);
      setDragX(deltaX);
      
      // Add rotation effect based on drag distance
      const rotation = Math.min(Math.abs(deltaX) / 10, 15);
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX > 0 ? rotation : -rotation}deg)`;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const threshold = 80;
    const timeElapsed = Date.now() - gestureStartTime.current;
    const velocity = Math.abs(dragX) / timeElapsed;
    
    // Enhanced swipe with velocity consideration
    if (Math.abs(dragX) > threshold || velocity > 0.5) {
      if (dragX > 0 && !isFirstCard) {
        recordCardInteraction('swipe_right');
        animateCardSwipe('right', () => handlePrevious());
      } else if (dragX < 0 && !isLastCard) {
        recordCardInteraction('swipe_left');
        animateCardSwipe('left', () => handleNext());
      } else {
        // Bounce back animation
        animateBounceBack();
      }
    } else {
      animateBounceBack();
    }
    
    setDragX(0);
    setIsDragging(false);
    startX.current = 0;
    startY.current = 0;
  }, [isDragging, dragX, isFirstCard, isLastCard]);

  // Enhanced animation functions
  const animateCardSwipe = useCallback((direction: 'left' | 'right', callback: () => void) => {
    setIsAnimating(true);
    
    if (cardRef.current) {
      const distance = direction === 'left' ? -window.innerWidth : window.innerWidth;
      const rotation = direction === 'left' ? -30 : 30;
      
      cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      cardRef.current.style.transform = `translateX(${distance}px) rotate(${rotation}deg)`;
      cardRef.current.style.opacity = '0';
    }
    
    setTimeout(() => {
      callback();
      if (cardRef.current) {
        cardRef.current.style.transition = '';
        cardRef.current.style.transform = '';
        cardRef.current.style.opacity = '';
      }
      setIsAnimating(false);
    }, 300);
  }, []);

  const animateBounceBack = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      cardRef.current.style.transform = 'translateX(0px) rotate(0deg)';
      
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = '';
        }
      }, 300);
    }
  }, []);

  const handleRevealContent = () => {
    setShowContent(true);
    recordCardInteraction('content_revealed');
    
    // Auto-read revealed content
    if (currentCard.content.hiddenContent && isAudioEnabled) {
      speakText(currentCard.content.hiddenContent);
    }
  };

  const handleFlipCard = () => {
    setCardFlipped(!cardFlipped);
    recordCardInteraction('content_revealed'); // Using existing type
  };

  const handleConfidenceSelect = (level: number) => {
    setConfidenceLevel(level);
    recordCardInteraction('content_revealed'); // Using existing type
  };

  const handleAddNote = () => {
    if (noteInput.trim()) {
      setCardNotes(prev => [...prev, noteInput.trim()]);
      recordCardInteraction('content_revealed'); // Using existing type
      setNoteInput('');
      setShowNotes(false);
    }
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    recordCardInteraction('content_revealed'); // Using existing type
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (!isFirstCard) {
      recordCardInteraction('navigation_previous');
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    const cardTimeSpent = Math.round((Date.now() - cardStartTime) / 1000);
    
    updateCardProgress(pathId, currentCard.id, {
      status: 'mastered',
      attempts: 1,
      correct_answers: 1,
      time_spent: cardTimeSpent,
      confidence_level: 4
    });

    setSessionCards(prev => [...prev, currentCard.id]);
    setSessionAnswers(prev => ({ 
      correct: prev.correct + 1, 
      total: prev.total + 1 
    }));

    if (!isLastCard) {
      recordCardInteraction('navigation_next');
      setCurrentIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    recordCardInteraction('card_completed');
    markCardAsComplete(pathId, currentCard.id);
    updateProgress(pathId, currentIndex + 1, cards.length);
    
    const accuracy = sessionAnswers.total > 0 ? (sessionAnswers.correct / sessionAnswers.total) * 100 : 100;
    endSession(accuracy, [...sessionCards, currentCard.id]);
    
    onComplete?.();
  };

  // Content interaction handlers
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    recordCardInteraction(isBookmarked ? 'bookmark_removed' : 'bookmark_added');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    recordCardInteraction(isLiked ? 'like_removed' : 'like_added');
  };

  // Enhanced video handlers
  const handleVideoPlay = () => {
    recordCardInteraction('video_played');
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleVideoPause = () => {
    recordCardInteraction('video_paused');
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const progress = (video.currentTime / video.duration) * 100;
    setVideoProgress(progress);
    
    if (progress >= 95) {
      recordCardInteraction('video_completed');
      if (autoAdvanceVideos && currentVideoIndex < currentVideos.length - 1) {
        setTimeout(() => setCurrentVideoIndex(prev => prev + 1), 1000);
      }
    }
  };

  const switchVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setVideoProgress(0);
  };

  // Enhanced quiz handlers
  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const submitQuiz = () => {
    if (selectedAnswer === null || !currentCard.content.quiz) return;
    
    const isCorrect = selectedAnswer === currentCard.content.quiz.correctAnswer;
    setQuizCorrect(isCorrect);
    setQuizSubmitted(true);
    
    if (isCorrect) {
      setQuizScore(prev => prev + (currentCard.content.quiz?.points || 10));
      setQuizStreak(prev => prev + 1);
    } else {
      setQuizStreak(0);
    }
    
    setSessionAnswers(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    recordCardInteraction('quiz_completed');
    
    setTimeout(() => {
      setShowQuizResults(true);
      setTimeout(() => {
        setShowQuiz(false);
        setShowQuizResults(false);
        if (!isLastCard) {
          handleNext();
        }
      }, 3000);
    }, 1500);
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

  // Quick card switch with click
  const handleCardClick = (direction: 'left' | 'right') => {
    if (direction === 'left' && !isFirstCard) {
      animateCardSwipe('right', () => handlePrevious());
    } else if (direction === 'right' && !isLastCard) {
      animateCardSwipe('left', () => handleNext());
    }
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
      {/* Enhanced Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className="text-xs font-medium text-white drop-shadow">
            {currentIndex + 1}/{cards.length}
          </span>
          <span className="text-xs font-medium text-white drop-shadow">
            {Math.round(((currentIndex + 1) / cards.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Card Counter with Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-600">
          <span className="flex items-center space-x-1">
            <AcademicCapIcon className="w-4 h-4" />
            <span>Card {currentIndex + 1} of {cards.length}</span>
          </span>
          <span className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{Math.round(timeSpent / 1000)}s</span>
          </span>
        </div>
        
        {quizStreak > 0 && (
          <div className="flex items-center space-x-1 text-green-600">
            <SparklesIcon className="w-4 h-4" />
            <span>{quizStreak} streak!</span>
          </div>
        )}
      </div>

      {/* Main Card with Enhanced Interactions */}
      <div className="relative overflow-hidden">
        <Card 
          ref={cardRef}
          className={`relative transition-all duration-300 select-none ${
            isAnimating ? 'pointer-events-none' : ''
          } hover:shadow-xl cursor-grab active:cursor-grabbing`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
            <h2 className="text-2xl font-bold text-gray-900">
              {currentCard.title}
            </h2>

            {currentCard.content.question && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 font-medium">
                  {currentCard.content.question}
                </p>
              </div>
            )}

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
                    🔍 Reveal Answer / More Content
                  </Button>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
                    <div className="text-green-900">
                      {currentCard.content.hiddenContent}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Video Section */}
            {currentVideos.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    📹 Related Videos
                  </h3>
                  <button
                    onClick={() => setShowVideoPlaylist(!showVideoPlaylist)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showVideoPlaylist ? 'Hide' : 'Show'} Playlist
                  </button>
                </div>
                
                {/* Video Player */}
                <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-auto"
                    poster={currentVideos[currentVideoIndex].thumbnail}
                    controls
                    preload="metadata"
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onTimeUpdate={handleVideoProgress}
                  >
                    <source src={currentVideos[currentVideoIndex].url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h4 className="text-white font-medium">
                      {currentVideos[currentVideoIndex].title}
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {currentVideos[currentVideoIndex].description}
                    </p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                    <div 
                      className="h-1 bg-blue-500 transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
                
                {/* Video Playlist */}
                {showVideoPlaylist && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentVideos.map((video, index) => (
                      <button
                        key={video.id}
                        onClick={() => switchVideo(index)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          index === currentVideoIndex
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-16 h-9 object-cover rounded"
                          />
                          <div>
                            <h5 className="font-medium text-sm">{video.title}</h5>
                            <p className="text-xs text-gray-500 mt-1">
                              {Math.floor(video.duration! / 60)}:{(video.duration! % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Key Points */}
            {currentCard.content.keyPoints && currentCard.content.keyPoints.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">💡 Key Points:</h4>
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

            {/* Code Snippets */}
            {currentCard.content.codeSnippet && (
              <div className="mt-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{currentCard.content.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        </Card>

        {/* Click Areas for Quick Navigation */}
        <div className="absolute inset-y-0 left-0 w-1/4 cursor-pointer" 
             onClick={() => handleCardClick('left')}
             title="Previous card" />
        <div className="absolute inset-y-0 right-0 w-1/4 cursor-pointer" 
             onClick={() => handleCardClick('right')}
             title="Next card" />
      </div>

      {/* Enhanced Quiz Modal */}
      {showQuiz && currentCard.content.quiz && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {!showQuizResults ? (
              <div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AcademicCapIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    🧠 Knowledge Check
                  </h3>
                  <p className="text-gray-600">
                    Test your understanding before moving forward
                  </p>
                  {quizStreak > 0 && (
                    <div className="mt-2 text-green-600 font-medium">
                      🔥 {quizStreak} correct in a row!
                    </div>
                  )}
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
                        Moving to results...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <SparklesIcon className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Quiz Complete!
                </h3>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{quizScore}</div>
                    <div className="text-sm text-blue-800">Total Points</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{quizStreak}</div>
                    <div className="text-sm text-green-800">Current Streak</div>
                  </div>
                </div>
                <p className="text-gray-600">
                  Great job! Moving to the next card...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Navigation Controls */}
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
          {/* Enhanced Navigation Dots */}
          <div className="flex space-x-1">
            {cards.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
              const actualIndex = Math.max(0, currentIndex - 2) + index;
              return (
                <button
                  key={actualIndex}
                  onClick={() => setCurrentIndex(actualIndex)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    actualIndex === currentIndex 
                      ? 'bg-primary-600 scale-125' 
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

      {/* Enhanced Quick Actions */}
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
        <span className="flex items-center space-x-1">
          <span>👆 Swipe or click sides to navigate</span>
        </span>
        <span>•</span>
        <span>Space to reveal content</span>
        {currentVideos.length > 0 && (
          <>
            <span>•</span>
            <span>📹 {currentVideos.length} related videos</span>
          </>
        )}
      </div>
    </div>
  );
};
