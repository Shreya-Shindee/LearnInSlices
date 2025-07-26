import React, { useState, useEffect } from 'react';
import {
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
  StarIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useProgressStore } from '../../store/progressStore';

interface ProgressTrackingSystemProps {
  sessionActive?: boolean;
  onSessionToggle?: () => void;
}

interface ProgressMetrics {
  dailyGoal: number;
  dailyProgress: number;
  weeklyGoal: number;
  weeklyProgress: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  nextLevelXP: number;
  accuracy: number;
  timeStudied: number;
  cardsCompleted: number;
  pathsCompleted: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  threshold: number;
  category: 'streak' | 'time' | 'accuracy' | 'completion';
}

const ProgressTrackingSystem: React.FC<ProgressTrackingSystemProps> = ({
  sessionActive = false,
  onSessionToggle
}) => {
  const { userStats, updateStreak, addXP, recordDailyProgress } = useProgressStore();
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionCards, setSessionCards] = useState(0);
  const [dailyGoalProgress, setDailyGoalProgress] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  const [metrics] = useState<ProgressMetrics>({
    dailyGoal: 30, // minutes
    dailyProgress: 0,
    weeklyGoal: 210, // minutes (30 * 7)
    weeklyProgress: 0,
    currentStreak: userStats.current_streak || 0,
    longestStreak: userStats.longest_streak || 0,
    totalXP: userStats.total_xp || 0,
    level: userStats.current_level || 1,
    nextLevelXP: 1000,
    accuracy: userStats.average_accuracy || 0,
    timeStudied: userStats.total_time_studied || 0,
    cardsCompleted: userStats.cards_mastered || 0,
    pathsCompleted: userStats.paths_completed || 0
  });

  // Sample achievements
  const achievements: Achievement[] = [
    {
      id: 'first-session',
      title: 'Getting Started',
      description: 'Complete your first learning session',
      icon: '🎯',
      earned: metrics.cardsCompleted > 0,
      progress: Math.min(metrics.cardsCompleted, 1) * 100,
      threshold: 1,
      category: 'completion'
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      earned: metrics.currentStreak >= 7,
      progress: Math.min(metrics.currentStreak / 7, 1) * 100,
      threshold: 7,
      category: 'streak'
    },
    {
      id: 'accuracy-90',
      title: 'Precision Master',
      description: 'Achieve 90% accuracy',
      icon: '🎯',
      earned: metrics.accuracy >= 90,
      progress: Math.min(metrics.accuracy / 90, 1) * 100,
      threshold: 90,
      category: 'accuracy'
    },
    {
      id: 'time-60',
      title: 'Hour Hero',
      description: 'Study for 60 minutes total',
      icon: '⏰',
      earned: metrics.timeStudied >= 60,
      progress: Math.min(metrics.timeStudied / 60, 1) * 100,
      threshold: 60,
      category: 'time'
    },
    {
      id: 'cards-100',
      title: 'Century Club',
      description: 'Complete 100 cards',
      icon: '💯',
      earned: metrics.cardsCompleted >= 100,
      progress: Math.min(metrics.cardsCompleted / 100, 1) * 100,
      threshold: 100,
      category: 'completion'
    }
  ];

  useEffect(() => {
    let interval: number;
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionActive]);

  useEffect(() => {
    // Update daily goal progress
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = userStats.weekly_progress?.find(p => p.date === today);
    setDailyGoalProgress(todayProgress?.minutes_studied || 0);
  }, [userStats.weekly_progress]);

  useEffect(() => {
    // Check for new achievements
    const newlyEarned = achievements.filter(achievement => 
      achievement.earned && !recentAchievements.find(r => r.id === achievement.id)
    );
    
    if (newlyEarned.length > 0) {
      setRecentAchievements(prev => [...prev, ...newlyEarned].slice(-3));
      // Show achievement notification
      setTimeout(() => {
        setRecentAchievements(prev => prev.filter(a => !newlyEarned.includes(a)));
      }, 5000);
    }
  }, [achievements, recentAchievements]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  const getXPForLevel = (level: number): number => {
    return level * 1000; // 1000 XP per level
  };

  const progressToNextLevel = (): number => {
    const currentLevelXP = getXPForLevel(metrics.level - 1);
    const nextLevelXP = getXPForLevel(metrics.level);
    const progress = metrics.totalXP - currentLevelXP;
    const required = nextLevelXP - currentLevelXP;
    return Math.min((progress / required) * 100, 100);
  };

  const handleSessionEnd = () => {
    // Record session data
    const today = new Date().toISOString().split('T')[0];
    recordDailyProgress({
      date: today,
      minutes_studied: Math.round(sessionTime / 60),
      cards_reviewed: sessionCards,
      xp_earned: sessionCards * 10,
      accuracy: 85 // Mock accuracy
    });

    // Add XP
    addXP(sessionCards * 10);
    
    // Update streak
    updateStreak();

    // Reset session counters
    setSessionTime(0);
    setSessionCards(0);
    
    if (onSessionToggle) onSessionToggle();
  };

  return (
    <div className="space-y-6">
      {/* Achievement Notifications */}
      {recentAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {recentAchievements.map(achievement => (
            <div
              key={achievement.id}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg animate-slide-in-right max-w-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <h4 className="font-bold">Achievement Unlocked!</h4>
                  <p className="text-sm">{achievement.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Session */}
      {sessionActive && (
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5" />
                <span className="text-lg font-bold">{formatTime(sessionTime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>{sessionCards} cards</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSessionToggle}
                className="text-white border-white hover:bg-white hover:text-primary-600"
              >
                <PauseIcon className="w-4 h-4 mr-1" />
                Pause
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSessionEnd}
                className="text-white border-white hover:bg-white hover:text-primary-600"
              >
                End Session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Goal */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Daily Goal</span>
            </div>
            <span className="text-sm text-gray-600">
              {formatMinutes(dailyGoalProgress)} / {formatMinutes(metrics.dailyGoal)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((dailyGoalProgress / metrics.dailyGoal) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            {Math.max(0, metrics.dailyGoal - dailyGoalProgress)} min remaining
          </p>
        </div>

        {/* Current Streak */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Streak</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {metrics.currentStreak}
            </div>
            <p className="text-sm text-gray-600">
              days • best: {metrics.longestStreak}
            </p>
          </div>
        </div>

        {/* Level & XP */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Level {metrics.level}</span>
            </div>
            <span className="text-sm text-gray-600">
              {metrics.totalXP} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel()}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            {getXPForLevel(metrics.level) - metrics.totalXP} XP to next level
          </p>
        </div>

        {/* Accuracy */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-gray-900">Accuracy</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {metrics.accuracy.toFixed(0)}%
            </div>
            <p className="text-sm text-gray-600">
              {metrics.cardsCompleted} cards completed
            </p>
          </div>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
          Learning Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatMinutes(metrics.timeStudied)}
            </div>
            <p className="text-sm text-gray-600">Total Study Time</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.cardsCompleted}
            </div>
            <p className="text-sm text-gray-600">Cards Mastered</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.pathsCompleted}
            </div>
            <p className="text-sm text-gray-600">Paths Completed</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(metrics.timeStudied / Math.max(metrics.cardsCompleted, 1))}m
            </div>
            <p className="text-sm text-gray-600">Avg. Time per Card</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrophyIcon className="w-5 h-5 mr-2 text-yellow-600" />
            Achievements
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAchievements(!showAchievements)}
          >
            {showAchievements ? 'Hide' : 'View All'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(showAchievements ? achievements : achievements.slice(0, 3)).map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.earned
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    achievement.earned ? 'text-yellow-900' : 'text-gray-700'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm ${
                    achievement.earned ? 'text-yellow-700' : 'text-gray-600'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <CheckCircleIcon className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              
              {!achievement.earned && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {!sessionActive && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onSessionToggle}
              className="bg-gradient-to-r from-primary-500 to-secondary-500"
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              Start Learning Session
            </Button>
            
            <Button variant="outline">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              View Detailed Analytics
            </Button>
            
            <Button variant="outline">
              <AcademicCapIcon className="w-4 h-4 mr-2" />
              Browse Learning Paths
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTrackingSystem;
