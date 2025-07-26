import React, { useEffect, useState } from 'react';
import { useProgressStore } from '../../store';

interface ProgressAnalyticsProps {
  className?: string;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ 
  className = "" 
}) => {
  const {
    userStats,
    insights,
    sessions,
    getTodayProgress,
    getStreakStatus,
    getXPToNextLevel,
    generateInsights
  } = useProgressStore();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month'>('week');

  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  const todayProgress = getTodayProgress();
  const streakStatus = getStreakStatus();
  const xpToNextLevel = getXPToNextLevel();
  const levelProgress = ((userStats.total_xp % 100) / 100) * 100;

  // Calculate weekly averages
  const recentProgress = userStats.weekly_progress.slice(0, 7);
  const weeklyAverage = {
    minutes: recentProgress.reduce((sum, p) => sum + p.minutes_studied, 0) / 7,
    accuracy: recentProgress.reduce((sum, p) => sum + p.accuracy, 0) / recentProgress.length || 0,
    cards: recentProgress.reduce((sum, p) => sum + p.cards_reviewed, 0) / 7
  };

  // Get today's goal progress
  const todayGoalProgress = todayProgress 
    ? (todayProgress.minutes_studied / userStats.daily_goal) * 100
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* XP & Level */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Level Progress</h3>
            <span className="text-2xl font-bold text-blue-600">
              {userStats.current_level}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>XP: {userStats.total_xp}</span>
              <span>Next: {xpToNextLevel}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Current Streak</h3>
            <div className="text-2xl">
              {streakStatus.canExtend ? '🔥' : '✨'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-600">
              {streakStatus.current} days
            </div>
            <div className="text-sm text-gray-600">
              Best: {userStats.longest_streak} days
            </div>
          </div>
        </div>

        {/* Today's Goal */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Daily Goal</h3>
            <div className="text-2xl">
              {todayGoalProgress >= 100 ? '🎯' : '⏰'}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">
              {todayProgress?.minutes_studied || 0}m
            </div>
            <div className="text-sm text-gray-600">
              of {userStats.daily_goal}m goal
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(todayGoalProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Avg Accuracy</h3>
            <div className="text-2xl">
              {userStats.average_accuracy >= 90 ? '🏆' : userStats.average_accuracy >= 70 ? '👍' : '📚'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(userStats.average_accuracy)}%
            </div>
            <div className="text-sm text-gray-600">
              {userStats.cards_mastered} cards mastered
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Study Progress</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTimeframe('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === 'week'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedTimeframe('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === 'month'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const dayProgress = userStats.weekly_progress[6 - index] || { minutes_studied: 0 };
              const height = Math.max(4, (dayProgress.minutes_studied / userStats.daily_goal) * 100);
              
              return (
                <div key={day} className="flex flex-col items-center space-y-2">
                  <div className="text-xs text-gray-600">{day}</div>
                  <div 
                    className="w-8 bg-blue-600 rounded-t-md"
                    style={{ 
                      height: `${Math.min(height, 100)}px`,
                      opacity: dayProgress.minutes_studied > 0 ? 1 : 0.2
                    }}
                  />
                  <div className="text-xs text-gray-500">
                    {dayProgress.minutes_studied}m
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Weekly Averages */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(weeklyAverage.minutes)}m
              </div>
              <div className="text-sm text-gray-600">Avg Daily</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {Math.round(weeklyAverage.accuracy)}%
              </div>
              <div className="text-sm text-gray-600">Avg Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {Math.round(weeklyAverage.cards)}
              </div>
              <div className="text-sm text-gray-600">Avg Cards/Day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Insights */}
      {insights.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Learning Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'strength' 
                    ? 'bg-green-50 border-green-400'
                    : insight.type === 'weakness'
                    ? 'bg-red-50 border-red-400'
                    : insight.type === 'recommendation'
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-yellow-50 border-yellow-400'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-lg">
                    {insight.type === 'strength' && '💪'}
                    {insight.type === 'weakness' && '🎯'}
                    {insight.type === 'recommendation' && '💡'}
                    {insight.type === 'pattern' && '📊'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <div className="mt-2">
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Learn More →
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(insight.confidence * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Sessions
        </h3>
        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.slice(-5).reverse().map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {session.cards_studied.length} cards studied
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(session.started_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {session.duration}m
                  </div>
                  <div className="text-xs text-gray-600">
                    {Math.round(session.accuracy)}% accuracy
                  </div>
                </div>
                <div className="text-sm font-medium text-blue-600">
                  +{session.xp_earned} XP
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📚</div>
            <p>No learning sessions yet</p>
            <p className="text-sm mt-1">Start studying to see your progress here!</p>
          </div>
        )}
      </div>
    </div>
  );
};
