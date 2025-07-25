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

export interface UserStats {
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  cards_mastered: number;
  badges_earned: number;
  challenges_completed: number;
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
  content: string;
  card_type: 'concept' | 'example' | 'practice' | 'quiz';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  estimated_time_minutes: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  learning_path_id: string;
  current_card_id?: string;
  completion_percentage: number;
  mastery_score: number;
  time_spent_minutes: number;
  last_accessed: string;
  created_at: string;
  updated_at: string;
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
