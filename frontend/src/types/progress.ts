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
