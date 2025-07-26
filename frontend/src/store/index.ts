import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, UserStats, LearningPath, UserProgress } from '../types';
import { apiService } from '../services/api';

// Auth Store
interface AuthState {
  user: User | null;
  userStats: UserStats | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        userStats: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await apiService.login({ email, password });
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            
            // Load user stats after successful login
            await get().loadUser();
          } catch (error: any) {
            set({
              error: error.response?.data?.detail || 'Login failed',
              isLoading: false,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        register: async (data) => {
          set({ isLoading: true, error: null });
          try {
            await apiService.register(data);
            // After registration, automatically login
            await get().login(data.email, data.password);
          } catch (error: any) {
            set({
              error: error.response?.data?.detail || 'Registration failed',
              isLoading: false,
            });
            throw error;
          }
        },

        logout: () => {
          apiService.logout();
          set({
            user: null,
            userStats: null,
            isAuthenticated: false,
            error: null,
          });
        },

        loadUser: async () => {
          if (!apiService.isAuthenticated()) return;
          
          set({ isLoading: true });
          try {
            const [userResponse, statsResponse] = await Promise.all([
              apiService.getCurrentUser(),
              apiService.getUserStats(get().user?.id || ''),
            ]);
            
            set({
              user: userResponse.data,
              userStats: statsResponse.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error: any) {
            console.error('Failed to load user:', error);
            set({
              error: 'Failed to load user data',
              isLoading: false,
            });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Learning Store
interface LearningState {
  currentPath: LearningPath | null;
  userProgress: UserProgress | null;
  availablePaths: LearningPath[];
  interactions: any[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentPath: (path: LearningPath) => void;
  loadLearningPaths: (filters?: { category?: string; difficulty?: string }) => Promise<void>;
  loadPathProgress: (pathId: string) => Promise<void>;
  createPath: (data: Partial<LearningPath>) => Promise<LearningPath>;
  generatePath: (topic: string, options?: any) => Promise<string>; // Returns task ID
  recordInteraction: (interaction: any) => void;
  markCardAsComplete: (pathId: string, cardId: string) => void;
  updateProgress: (pathId: string, currentCard: number, totalCards: number) => void;
  clearError: () => void;
}

export const useLearningStore = create<LearningState>()(
  devtools(
    (set, get) => ({
      currentPath: null,
      userProgress: null,
      availablePaths: [],
      interactions: [],
      isLoading: false,
      error: null,

      setCurrentPath: (path) => {
        set({ currentPath: path });
      },

      loadLearningPaths: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.getLearningPaths(filters);
          set({
            availablePaths: response.data.items,
            isLoading: false,
          });
        } catch (error: any) {
          console.log('API not available, using sample data');
          // For demo purposes, use sample data when API is not available
          const { sampleLearningPaths } = await import('../data/sampleData');
          
          // Apply filters to sample data
          let filteredPaths = sampleLearningPaths;
          if (filters.category && filters.category !== 'all') {
            filteredPaths = filteredPaths.filter(path => path.category === filters.category);
          }
          if (filters.difficulty) {
            filteredPaths = filteredPaths.filter(path => path.difficulty_level === filters.difficulty);
          }
          
          set({
            availablePaths: filteredPaths,
            isLoading: false,
          });
        }
      },

      loadPathProgress: async (pathId: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true });
        try {
          const response = await apiService.getUserProgress(user.id, pathId);
          set({
            userProgress: response.data,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Failed to load progress:', error);
          set({
            error: 'Failed to load progress',
            isLoading: false,
          });
        }
      },

      createPath: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.createLearningPath(data);
          set({ isLoading: false });
          
          // Refresh the paths list
          await get().loadLearningPaths();
          
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to create learning path',
            isLoading: false,
          });
          throw error;
        }
      },

      generatePath: async (topic, options) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.generateLearningPath(topic, options);
          set({ isLoading: false });
          return response.data.task_id;
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to generate learning path',
            isLoading: false,
          });
          throw error;
        }
      },

      recordInteraction: (interaction) => {
        set((state) => ({
          interactions: [...state.interactions, interaction]
        }));
        
        // In a real app, this would also send to the backend
        console.log('Recorded interaction:', interaction);
      },

      markCardAsComplete: (pathId: string, cardId: string) => {
        // In a real app, this would send to the backend
        console.log('Card completed:', { pathId, cardId });
        
        // Update local progress
        set((state) => {
          if (state.userProgress && state.userProgress.learning_path_id === pathId) {
            return {
              userProgress: {
                ...state.userProgress,
                current_card_id: cardId,
                last_accessed: new Date().toISOString(),
              }
            };
          }
          return state;
        });
      },

      updateProgress: (pathId: string, currentCard: number, totalCards: number) => {
        const completionPercentage = Math.round((currentCard / totalCards) * 100);
        
        // In a real app, this would send to the backend
        console.log('Progress updated:', { pathId, currentCard, totalCards, completionPercentage });
        
        // Update local progress
        set((state) => {
          if (state.userProgress && state.userProgress.learning_path_id === pathId) {
            return {
              userProgress: {
                ...state.userProgress,
                completion_percentage: completionPercentage,
                last_accessed: new Date().toISOString(),
              }
            };
          }
          return state;
        });
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'LearningStore' }
  )
);

// Review Store
interface ReviewState {
  dueCards: any[];
  currentSession: any | null;
  currentCard: any | null;
  sessionStats: {
    totalCards: number;
    correctAnswers: number;
    timeSpent: number;
  };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadDueCards: () => Promise<void>;
  startSession: (sessionType?: string) => Promise<void>;
  submitCardResponse: (cardId: string, response: any, timeTaken: number) => Promise<void>;
  completeSession: () => Promise<void>;
  clearError: () => void;
}

export const useReviewStore = create<ReviewState>()(
  devtools(
    (set, get) => ({
      dueCards: [],
      currentSession: null,
      currentCard: null,
      sessionStats: {
        totalCards: 0,
        correctAnswers: 0,
        timeSpent: 0,
      },
      isLoading: false,
      error: null,

      loadDueCards: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          const response = await apiService.getDueCards(user.id);
          set({
            dueCards: response.data,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to load due cards',
            isLoading: false,
          });
        }
      },

      startSession: async (sessionType = 'daily_review') => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true });
        try {
          const response = await apiService.startReviewSession(user.id, sessionType);
          set({
            currentSession: response.data,
            sessionStats: {
              totalCards: 0,
              correctAnswers: 0,
              timeSpent: 0,
            },
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to start review session',
            isLoading: false,
          });
        }
      },

      submitCardResponse: async (cardId, response, timeTaken) => {
        try {
          const result = await apiService.submitCardResponse(cardId, response, timeTaken);
          
          set((state) => ({
            sessionStats: {
              ...state.sessionStats,
              totalCards: state.sessionStats.totalCards + 1,
              correctAnswers: result.data.is_correct 
                ? state.sessionStats.correctAnswers + 1 
                : state.sessionStats.correctAnswers,
              timeSpent: state.sessionStats.timeSpent + timeTaken,
            },
          }));
          
          return result.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to submit response',
          });
          throw error;
        }
      },

      completeSession: async () => {
        const { currentSession, sessionStats } = get();
        if (!currentSession) return;

        try {
          await apiService.completeReviewSession(currentSession.id, {
            correct_answers: sessionStats.correctAnswers,
            total_time_minutes: Math.ceil(sessionStats.timeSpent / 60),
          });
          
          set({
            currentSession: null,
            currentCard: null,
            sessionStats: {
              totalCards: 0,
              correctAnswers: 0,
              timeSpent: 0,
            },
          });
          
          // Refresh user stats
          await useAuthStore.getState().loadUser();
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to complete session',
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'ReviewStore' }
  )
);

// UI Store for general app state
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
  }>;
  
  // Actions
  toggleTheme: () => void;
  toggleSidebar: () => void;
  addNotification: (type: UIState['notifications'][0]['type'], message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'light',
        sidebarOpen: false,
        notifications: [],

        toggleTheme: () => {
          set((state) => ({
            theme: state.theme === 'light' ? 'dark' : 'light',
          }));
        },

        toggleSidebar: () => {
          set((state) => ({
            sidebarOpen: !state.sidebarOpen,
          }));
        },

        addNotification: (type, message) => {
          const id = Date.now().toString();
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                id,
                type,
                message,
                timestamp: Date.now(),
              },
            ],
          }));

          // Auto-remove after 5 seconds
          setTimeout(() => {
            get().removeNotification(id);
          }, 5000);
        },

        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        },

        clearNotifications: () => {
          set({ notifications: [] });
        },
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          theme: state.theme,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

// Export progress store
export { useProgressStore } from './progressStore';
