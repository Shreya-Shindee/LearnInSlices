import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  ApiResponse, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData,
  User,
  UserStats,
  LearningPath,
  MicroCard,
  UserProgress,
  ReviewSession,
  CardSchedule,
  Badge,
  Challenge,
  StudyGroup,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearTokens();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    const tokens = localStorage.getItem('authTokens');
    if (tokens) {
      try {
        const parsed = JSON.parse(tokens);
        this.accessToken = parsed.access_token;
      } catch (error) {
        console.error('Error parsing stored tokens:', error);
        this.clearTokens();
      }
    }
  }

  private saveTokensToStorage(tokens: AuthTokens) {
    localStorage.setItem('authTokens', JSON.stringify(tokens));
    this.accessToken = tokens.access_token;
  }

  private clearTokens() {
    localStorage.removeItem('authTokens');
    this.accessToken = null;
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthTokens & { user: User }>> {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response: AxiosResponse<AuthTokens & { user: User }> = await this.api.post(
      '/auth/login',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const tokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in,
    };

    this.saveTokensToStorage(tokens);

    return {
      data: response.data,
      status: 'success',
    };
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<{ user: User }> = await this.api.post('/auth/register', data);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<User> = await this.api.get('/auth/me');
    return {
      data: response.data,
      status: 'success',
    };
  }

  // User Methods
  async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    const response: AxiosResponse<UserStats> = await this.api.get(`/users/${userId}/stats`);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async updateUserProfile(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse<User> = await this.api.put(`/users/${userId}`, data);
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Learning Path Methods
  async getLearningPaths(params?: {
    category?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PaginatedResponse<LearningPath>>> {
    const response: AxiosResponse<PaginatedResponse<LearningPath>> = await this.api.get(
      '/learning-paths',
      { params }
    );
    return {
      data: response.data,
      status: 'success',
    };
  }

  async getLearningPath(pathId: string): Promise<ApiResponse<LearningPath>> {
    const response: AxiosResponse<LearningPath> = await this.api.get(`/learning-paths/${pathId}`);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async createLearningPath(data: Partial<LearningPath>): Promise<ApiResponse<LearningPath>> {
    const response: AxiosResponse<LearningPath> = await this.api.post('/learning-paths', data);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async generateLearningPath(topic: string, options?: {
    difficulty?: string;
    duration_hours?: number;
    focus_areas?: string[];
  }): Promise<ApiResponse<{ task_id: string }>> {
    const response: AxiosResponse<{ task_id: string }> = await this.api.post(
      '/ai/generate-path',
      { topic, ...options }
    );
    return {
      data: response.data,
      status: 'success',
    };
  }

  async getGenerationStatus(taskId: string): Promise<ApiResponse<{
    status: string;
    result?: LearningPath;
    error?: string;
  }>> {
    const response = await this.api.get(`/ai/generation-status/${taskId}`);
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Micro Card Methods
  async getPathCards(pathId: string): Promise<ApiResponse<MicroCard[]>> {
    const response: AxiosResponse<MicroCard[]> = await this.api.get(
      `/learning-paths/${pathId}/cards`
    );
    return {
      data: response.data,
      status: 'success',
    };
  }

  async getCard(cardId: string): Promise<ApiResponse<MicroCard>> {
    const response: AxiosResponse<MicroCard> = await this.api.get(`/cards/${cardId}`);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async submitCardResponse(cardId: string, responseData: any, timeTaken: number): Promise<ApiResponse<{
    is_correct: boolean;
    xp_earned: number;
    next_review_date: string;
  }>> {
    const response = await this.api.post(`/cards/${cardId}/attempt`, {
      response_data: responseData,
      time_taken_seconds: timeTaken,
    });
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Progress Methods
  async getUserProgress(userId: string, pathId: string): Promise<ApiResponse<UserProgress>> {
    const response: AxiosResponse<UserProgress> = await this.api.get(
      `/users/${userId}/progress/${pathId}`
    );
    return {
      data: response.data,
      status: 'success',
    };
  }

  async updateProgress(userId: string, pathId: string, data: Partial<UserProgress>): Promise<ApiResponse<UserProgress>> {
    const response: AxiosResponse<UserProgress> = await this.api.put(
      `/users/${userId}/progress/${pathId}`,
      data
    );
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Spaced Repetition Methods
  async getDueCards(userId: string): Promise<ApiResponse<CardSchedule[]>> {
    const response: AxiosResponse<CardSchedule[]> = await this.api.get(
      `/users/${userId}/review/due`
    );
    return {
      data: response.data,
      status: 'success',
    };
  }

  async startReviewSession(userId: string, sessionType: string = 'daily_review'): Promise<ApiResponse<ReviewSession>> {
    const response: AxiosResponse<ReviewSession> = await this.api.post(
      `/users/${userId}/review/session`,
      { session_type: sessionType }
    );
    return {
      data: response.data,
      status: 'success',
    };
  }

  async completeReviewSession(sessionId: string, data: {
    correct_answers: number;
    total_time_minutes: number;
  }): Promise<ApiResponse<ReviewSession>> {
    const response: AxiosResponse<ReviewSession> = await this.api.put(
      `/review/sessions/${sessionId}`,
      data
    );
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Gamification Methods
  async getUserBadges(userId: string): Promise<ApiResponse<Badge[]>> {
    const response: AxiosResponse<Badge[]> = await this.api.get(`/users/${userId}/badges`);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async getActiveChallenges(): Promise<ApiResponse<Challenge[]>> {
    const response: AxiosResponse<Challenge[]> = await this.api.get('/challenges/active');
    return {
      data: response.data,
      status: 'success',
    };
  }

  async joinChallenge(challengeId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await this.api.post(`/challenges/${challengeId}/join`);
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Study Group Methods
  async getStudyGroups(params?: {
    learning_path_id?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PaginatedResponse<StudyGroup>>> {
    const response: AxiosResponse<PaginatedResponse<StudyGroup>> = await this.api.get(
      '/study-groups',
      { params }
    );
    return {
      data: response.data,
      status: 'success',
    };
  }

  async createStudyGroup(data: Partial<StudyGroup>): Promise<ApiResponse<StudyGroup>> {
    const response: AxiosResponse<StudyGroup> = await this.api.post('/study-groups', data);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async joinStudyGroup(groupId: string, joinCode?: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await this.api.post(`/study-groups/${groupId}/join`, { join_code: joinCode });
    return {
      data: response.data,
      status: 'success',
    };
  }

  async getGroupMembers(groupId: string): Promise<ApiResponse<User[]>> {
    const response: AxiosResponse<User[]> = await this.api.get(`/study-groups/${groupId}/members`);
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Enhanced AI-Powered Features
  async getPersonalizedRecommendations(limit: number = 10): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/recommendations?limit=${limit}`);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async generateAIContent(request: {
    topic: string;
    difficulty?: string;
    learning_style?: string;
    context?: string;
    card_type?: string;
  }): Promise<ApiResponse<MicroCard>> {
    const response = await this.api.post('/ai/generate-content', request);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async createPersonalizedPath(request: {
    topic: string;
    skill_level?: string;
    goals?: string[];
    time_commitment?: number;
    preferred_topics?: string[];
  }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/ai/create-path', request);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async optimizeStudySchedule(): Promise<ApiResponse<any>> {
    const response = await this.api.post('/ai/optimize-review');
    return {
      data: response.data,
      status: 'success',
    };
  }

  async createStudySession(request: {
    duration_minutes: number;
    focus_areas?: string[];
    session_type?: string;
    difficulty_preference?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/study/session', request);
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Enhanced Analytics and Progress
  async getDetailedAnalytics(days: number = 30): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/users/me/analytics?days=${days}`);
    return {
      data: response.data,
      status: 'success',
    };
  }

  async getComprehensiveProgress(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/users/me/progress');
    return {
      data: response.data,
      status: 'success',
    };
  }

  async getDueReviews(): Promise<ApiResponse<MicroCard[]>> {
    const response = await this.api.get('/reviews/due');
    return {
      data: response.data,
      status: 'success',
    };
  }

  async getNextBestCard(sessionCards?: string[]): Promise<ApiResponse<any>> {
    const params = sessionCards ? { session_cards: sessionCards.join(',') } : {};
    const response = await this.api.get('/recommendations/next-card', { params });
    return {
      data: response.data,
      status: 'success',
    };
  }

  async getStudyPathRecommendation(request: {
    topic?: string;
    duration_minutes: number;
  }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/recommendations/study-path', request);
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Enhanced Review System
  async submitEnhancedReview(reviewData: {
    card_id: string;
    result: string;
    response_time?: number;
    confidence?: number;
    study_session_id?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/reviews', reviewData);
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Collaboration Features

  // Health Check
  async healthCheck(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/health');
    return {
      data: response.data,
      status: 'success',
    };
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
