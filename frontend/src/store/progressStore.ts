import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  UserProgress, 
  CardProgress, 
  LearningSession, 
  UserStats, 
  DailyProgress, 
  Achievement, 
  LearningInsight 
} from '../types';

interface ProgressState {
  // User Progress Data
  userProgress: Record<string, UserProgress>; // keyed by learning_path_id
  userStats: UserStats;
  achievements: Achievement[];
  sessions: LearningSession[];
  insights: LearningInsight[];
  
  // Current Session
  currentSession: LearningSession | null;
  sessionStartTime: number | null;
  
  // Actions
  startSession: (pathId: string) => void;
  endSession: (accuracy: number, cardsStudied: string[]) => void;
  updateCardProgress: (pathId: string, cardId: string, updates: Partial<CardProgress>) => void;
  updatePathProgress: (pathId: string, updates: Partial<UserProgress>) => void;
  addXP: (amount: number) => void;
  updateStreak: () => void;
  recordDailyProgress: (progress: DailyProgress) => void;
  unlockAchievement: (achievementId: string) => void;
  generateInsights: () => void;
  
  // Getters
  getPathProgress: (pathId: string) => UserProgress | null;
  getCardProgress: (pathId: string, cardId: string) => CardProgress | null;
  getTodayProgress: () => DailyProgress | null;
  getStreakStatus: () => { current: number; canExtend: boolean };
  getLevel: () => number;
  getXPToNextLevel: () => number;
}

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const calculateLevel = (xp: number): number => {
  // Level formula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const getXPForLevel = (level: number): number => {
  return Math.pow(level - 1, 2) * 100;
};

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const defaultUserStats: UserStats = {
  total_xp: 0,
  current_level: 1,
  current_streak: 0,
  longest_streak: 0,
  total_time_studied: 0,
  paths_completed: 0,
  cards_mastered: 0,
  average_accuracy: 0,
  daily_goal: 30, // 30 minutes per day
  weekly_progress: []
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      userProgress: {},
      userStats: defaultUserStats,
      achievements: [],
      sessions: [],
      insights: [],
      currentSession: null,
      sessionStartTime: null,

      startSession: (pathId: string) => {
        const sessionId = generateId();
        const now = new Date().toISOString();
        
        const newSession: LearningSession = {
          id: sessionId,
          user_id: 'demo-user', // In real app, get from auth store
          learning_path_id: pathId,
          cards_studied: [],
          duration: 0,
          accuracy: 0,
          xp_earned: 0,
          started_at: now,
          completed_at: ''
        };

        set({ 
          currentSession: newSession,
          sessionStartTime: Date.now()
        });
      },

      endSession: (accuracy: number, cardsStudied: string[]) => {
        const { currentSession, sessionStartTime } = get();
        if (!currentSession || !sessionStartTime) return;

        const duration = Math.round((Date.now() - sessionStartTime) / 60000); // minutes
        const xpEarned = Math.round(cardsStudied.length * 10 * (accuracy / 100));
        
        const completedSession: LearningSession = {
          ...currentSession,
          cards_studied: cardsStudied,
          duration,
          accuracy,
          xp_earned: xpEarned,
          completed_at: new Date().toISOString()
        };

        set(state => ({
          currentSession: null,
          sessionStartTime: null,
          sessions: [...state.sessions, completedSession],
          userStats: {
            ...state.userStats,
            total_xp: state.userStats.total_xp + xpEarned,
            current_level: calculateLevel(state.userStats.total_xp + xpEarned),
            total_time_studied: state.userStats.total_time_studied + duration,
            average_accuracy: state.sessions.length > 0 
              ? (state.userStats.average_accuracy * state.sessions.length + accuracy) / (state.sessions.length + 1)
              : accuracy
          }
        }));

        // Record daily progress
        get().recordDailyProgress({
          date: getTodayDateString(),
          minutes_studied: duration,
          cards_reviewed: cardsStudied.length,
          xp_earned: xpEarned,
          accuracy
        });

        // Add XP and update streak
        get().addXP(xpEarned);
        get().updateStreak();
      },

      updateCardProgress: (pathId: string, cardId: string, updates: Partial<CardProgress>) => {
        set(state => {
          const pathProgress = state.userProgress[pathId];
          if (!pathProgress) return state;

          const cardIndex = pathProgress.card_progress.findIndex(cp => cp.card_id === cardId);
          if (cardIndex === -1) {
            // Create new card progress
            const newCardProgress: CardProgress = {
              card_id: cardId,
              status: 'not_started',
              attempts: 0,
              correct_answers: 0,
              time_spent: 0,
              last_reviewed: new Date().toISOString(),
              next_review: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
              retention_score: 0,
              confidence_level: 1,
              ...updates
            };
            
            pathProgress.card_progress.push(newCardProgress);
          } else {
            // Update existing card progress
            pathProgress.card_progress[cardIndex] = {
              ...pathProgress.card_progress[cardIndex],
              ...updates,
              last_reviewed: new Date().toISOString()
            };
          }

          // Update overall path progress
          const totalCards = pathProgress.card_progress.length;
          const masteredCards = pathProgress.card_progress.filter(cp => cp.status === 'mastered').length;
          pathProgress.overall_progress = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0;
          pathProgress.updated_at = new Date().toISOString();

          return {
            ...state,
            userProgress: {
              ...state.userProgress,
              [pathId]: pathProgress
            }
          };
        });
      },

      updatePathProgress: (pathId: string, updates: Partial<UserProgress>) => {
        set(state => {
          const existing = state.userProgress[pathId];
          if (!existing) {
            // Create new path progress
            const newProgress: UserProgress = {
              id: generateId(),
              user_id: 'demo-user',
              learning_path_id: pathId,
              card_progress: [],
              overall_progress: 0,
              time_spent: 0,
              streak_count: 0,
              last_accessed: new Date().toISOString(),
              mastery_level: 'beginner',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...updates
            };
            
            return {
              ...state,
              userProgress: {
                ...state.userProgress,
                [pathId]: newProgress
              }
            };
          }

          return {
            ...state,
            userProgress: {
              ...state.userProgress,
              [pathId]: {
                ...existing,
                ...updates,
                updated_at: new Date().toISOString()
              }
            }
          };
        });
      },

      addXP: (amount: number) => {
        set(state => {
          const newXP = state.userStats.total_xp + amount;
          const newLevel = calculateLevel(newXP);
          const leveledUp = newLevel > state.userStats.current_level;

          if (leveledUp) {
            // Trigger level up achievement
            console.log(`🎉 Level up! You're now level ${newLevel}`);
          }

          return {
            ...state,
            userStats: {
              ...state.userStats,
              total_xp: newXP,
              current_level: newLevel
            }
          };
        });
      },

      updateStreak: () => {
        const today = getTodayDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        set(state => {
          const todayProgress = state.userStats.weekly_progress.find(p => p.date === today);
          const yesterdayProgress = state.userStats.weekly_progress.find(p => p.date === yesterday);
          
          let newStreak = state.userStats.current_streak;
          
          if (todayProgress && todayProgress.minutes_studied > 0) {
            if (yesterdayProgress && yesterdayProgress.minutes_studied > 0) {
              // Continuing streak
              newStreak = state.userStats.current_streak + 1;
            } else if (state.userStats.current_streak === 0) {
              // Starting new streak
              newStreak = 1;
            }
          }

          return {
            ...state,
            userStats: {
              ...state.userStats,
              current_streak: newStreak,
              longest_streak: Math.max(state.userStats.longest_streak, newStreak)
            }
          };
        });
      },

      recordDailyProgress: (progress: DailyProgress) => {
        set(state => {
          const existingIndex = state.userStats.weekly_progress.findIndex(p => p.date === progress.date);
          let newWeeklyProgress = [...state.userStats.weekly_progress];
          
          if (existingIndex >= 0) {
            // Update existing day
            newWeeklyProgress[existingIndex] = {
              ...newWeeklyProgress[existingIndex],
              minutes_studied: newWeeklyProgress[existingIndex].minutes_studied + progress.minutes_studied,
              cards_reviewed: newWeeklyProgress[existingIndex].cards_reviewed + progress.cards_reviewed,
              xp_earned: newWeeklyProgress[existingIndex].xp_earned + progress.xp_earned,
              accuracy: (newWeeklyProgress[existingIndex].accuracy + progress.accuracy) / 2
            };
          } else {
            // Add new day
            newWeeklyProgress.push(progress);
          }

          // Keep only last 30 days
          newWeeklyProgress = newWeeklyProgress
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 30);

          return {
            ...state,
            userStats: {
              ...state.userStats,
              weekly_progress: newWeeklyProgress
            }
          };
        });
      },

      unlockAchievement: (achievementId: string) => {
        set(state => {
          const existing = state.achievements.find(a => a.id === achievementId);
          if (existing?.earned_at) return state; // Already unlocked

          return {
            ...state,
            achievements: state.achievements.map(a => 
              a.id === achievementId 
                ? { ...a, earned_at: new Date().toISOString(), progress: 100 }
                : a
            )
          };
        });
      },

      generateInsights: () => {
        const { userStats, sessions } = get();
        const insights: LearningInsight[] = [];

        // Accuracy insights
        if (userStats.average_accuracy < 70) {
          insights.push({
            type: 'weakness',
            title: 'Focus on Accuracy',
            description: 'Your average accuracy is below 70%. Consider reviewing concepts more thoroughly before moving on.',
            confidence: 0.8,
            actionable: true
          });
        } else if (userStats.average_accuracy > 90) {
          insights.push({
            type: 'strength',
            title: 'Excellent Accuracy!',
            description: 'Your high accuracy shows strong comprehension. You might benefit from more challenging content.',
            confidence: 0.9,
            actionable: true
          });
        }

        // Streak insights
        if (userStats.current_streak >= 7) {
          insights.push({
            type: 'strength',
            title: 'Great Consistency!',
            description: `You've maintained a ${userStats.current_streak}-day learning streak. Keep it up!`,
            confidence: 1.0,
            actionable: false
          });
        }

        // Study time insights
        const recentSessions = sessions.slice(-7); // Last 7 sessions
        const avgSessionLength = recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length;
        
        if (avgSessionLength < 5) {
          insights.push({
            type: 'recommendation',
            title: 'Extend Study Sessions',
            description: 'Your sessions are quite short. Longer sessions (10-15 minutes) might improve retention.',
            confidence: 0.7,
            actionable: true
          });
        }

        set(state => ({ ...state, insights }));
      },

      // Getters
      getPathProgress: (pathId: string) => {
        return get().userProgress[pathId] || null;
      },

      getCardProgress: (pathId: string, cardId: string) => {
        const pathProgress = get().userProgress[pathId];
        if (!pathProgress) return null;
        return pathProgress.card_progress.find(cp => cp.card_id === cardId) || null;
      },

      getTodayProgress: () => {
        const today = getTodayDateString();
        return get().userStats.weekly_progress.find(p => p.date === today) || null;
      },

      getStreakStatus: () => {
        const todayProgress = get().getTodayProgress();
        const hasStudiedToday = todayProgress && todayProgress.minutes_studied > 0;
        
        return {
          current: get().userStats.current_streak,
          canExtend: !hasStudiedToday
        };
      },

      getLevel: () => {
        return get().userStats.current_level;
      },

      getXPToNextLevel: () => {
        const { total_xp, current_level } = get().userStats;
        const nextLevelXP = getXPForLevel(current_level + 1);
        return nextLevelXP - total_xp;
      }
    }),
    {
      name: 'progress-store',
      version: 1
    }
  )
);
