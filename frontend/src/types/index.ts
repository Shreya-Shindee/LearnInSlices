// Core User Types
export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Learning Content Types
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_hours: number;
  is_public: boolean;
  tags: string[];
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface MicroCard {
  id: string;
  learning_path_id: string;
  title: string;
  content: MicroCardContent;
  type: 'concept' | 'example' | 'practice' | 'quiz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  estimatedTime: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MicroCardContent {
  text?: string;
  question?: string;
  hiddenContent?: string;
  imageUrl?: string;
  videoUrl?: string;
  videoPoster?: string;
  videoThumbnail?: string;
  videoDescription?: string;
  codeSnippet?: string;
  keyPoints?: string[];
  examples?: string[];
  resources?: { title: string; url: string; type: string }[];
  quiz?: QuizContent;
  interactiveElements?: InteractiveElement[];
  // New enhanced content types
  animations?: AnimationConfig[];
  videos?: VideoContent[];
  practiceExercises?: PracticeExercise[];
}

export interface QuizContent {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points?: number;
}

// Enhanced content types for engaging microcards
export interface VideoContent {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number; // in seconds
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  transcript?: string;
}

export interface AnimationConfig {
  type: 'slide' | 'fade' | 'zoom' | 'flip' | 'bounce';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number; // in milliseconds
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface PracticeExercise {
  id: string;
  type: 'coding' | 'multiple-choice' | 'drag-drop' | 'fill-blank';
  question: string;
  answer: string | string[];
  hints?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  velocity: number;
  distance: number;
}

export interface CardAnimation {
  enter: AnimationConfig;
  exit: AnimationConfig;
}

export interface InteractiveElement {
  type: 'button' | 'input' | 'slider' | 'toggle';
  label: string;
  action?: string;
  value?: any;
}

export interface CardInteraction {
  cardId: string;
  pathId: string;
  type: 'content_revealed' | 'bookmark_added' | 'bookmark_removed' | 
        'like_added' | 'like_removed' | 'navigation_next' | 'navigation_previous' | 
        'card_completed' | 'time_spent' | 'quiz_completed' | 'quiz_answered' | 
        'video_played' | 'video_paused' | 'video_completed' | 
        'swipe_left' | 'swipe_right' | 'animation_triggered';
  timeSpent: number;
  timestamp: string;
  additionalData?: Record<string, any>;
}

// Enhanced quiz system types
export interface QuizSession {
  id: string;
  cardIds: string[];
  startTime: string;
  endTime?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  userAnswers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: string;
}

export interface CardAttempt {
  id: string;
  user_id: string;
  card_id: string;
  attempt_number: number;
  response_data: Record<string, any>;
  is_correct: boolean;
  confidence_level: number;
  time_taken_seconds: number;
  created_at: string;
}

// Spaced Repetition Types
export interface ReviewSession {
  id: string;
  user_id: string;
  session_type: 'daily_review' | 'intensive_review' | 'challenge_mode';
  total_cards: number;
  correct_answers: number;
  total_time_minutes: number;
  xp_earned: number;
  created_at: string;
}

export interface CardSchedule {
  id: string;
  user_id: string;
  card_id: string;
  next_review_date: string;
  ease_factor: number;
  repetition_count: number;
  interval_days: number;
  last_reviewed?: string;
  mastery_level: number;
  created_at: string;
  updated_at: string;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  badge_type: 'achievement' | 'milestone' | 'social' | 'special';
  criteria: Record<string, any>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress_data?: Record<string, any>;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'daily' | 'weekly' | 'special' | 'community';
  start_date: string;
  end_date: string;
  criteria: Record<string, any>;
  rewards: Record<string, any>;
  max_participants?: number;
  is_active: boolean;
  created_at: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  learning_path_id: string;
  creator_id: string;
  member_limit?: number;
  is_public: boolean;
  join_code?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ReviewCardState extends MicroCard {
  userProgress?: CardSchedule;
  isRevealed: boolean;
  userAnswer?: any;
  timeStarted: number;
}

// Form Types
export interface CreatePathForm {
  title: string;
  description: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  estimated_duration_hours: number;
  is_public: boolean;
}

export interface JoinGroupForm {
  join_code: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface StudySessionUpdate {
  type: 'peer_joined' | 'peer_left' | 'progress_update' | 'chat_message';
  user_id: string;
  data: any;
}

// Progress Tracking Types
export interface UserProgress {
  id: string;
  user_id: string;
  learning_path_id: string;
  card_progress: CardProgress[];
  overall_progress: number; // 0-100
  time_spent: number; // in minutes
  streak_count: number;
  last_accessed: string;
  mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  completion_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CardProgress {
  card_id: string;
  status: 'not_started' | 'in_progress' | 'review' | 'mastered';
  attempts: number;
  correct_answers: number;
  time_spent: number; // in seconds
  difficulty_rating?: number; // 1-5 user feedback
  last_reviewed: string;
  next_review: string;
  retention_score: number; // 0-1 based on spaced repetition
  confidence_level: number; // 1-5 user self-assessment
}

export interface LearningSession {
  id: string;
  user_id: string;
  learning_path_id: string;
  cards_studied: string[];
  duration: number; // in minutes
  accuracy: number; // 0-100
  xp_earned: number;
  started_at: string;
  completed_at: string;
}

export interface UserStats {
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  total_time_studied: number; // in minutes
  paths_completed: number;
  cards_mastered: number;
  average_accuracy: number;
  daily_goal: number; // minutes per day
  weekly_progress: DailyProgress[];
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  minutes_studied: number;
  cards_reviewed: number;
  xp_earned: number;
  accuracy: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'time' | 'accuracy' | 'completion' | 'social';
  threshold: number;
  earned_at?: string;
  progress: number; // 0-100
}

export interface LearningInsight {
  type: 'strength' | 'weakness' | 'recommendation' | 'pattern';
  title: string;
  description: string;
  data?: any;
  confidence: number; // 0-1
  actionable: boolean;
}
