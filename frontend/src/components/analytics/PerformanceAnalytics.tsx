import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  FireIcon, 
  TrophyIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  BoltIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface PerformanceAnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  studyStreak: number;
  totalXP: number;
  cardsCompleted: number;
  averageScore: number;
  timeSpent: number; // in minutes
  level: number;
  weeklyProgress: number[];
  achievements: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ className }) => {
  const [analyticsData] = useState<AnalyticsData>({
    studyStreak: 12,
    totalXP: 3456,
    cardsCompleted: 167,
    averageScore: 87,
    timeSpent: 1247, // minutes
    level: 14,
    weeklyProgress: [75, 82, 90, 78, 95, 88, 92],
    achievements: ['Speed Learner', 'Consistent Performer', 'Quiz Master'],
    strengthAreas: ['React Fundamentals', 'JavaScript ES6', 'CSS Grid'],
    improvementAreas: ['TypeScript', 'Node.js', 'Testing']
  });

  const [animatedValues, setAnimatedValues] = useState({
    studyStreak: 0,
    totalXP: 0,
    cardsCompleted: 0,
    averageScore: 0
  });

  // Animate numbers on component mount
  useEffect(() => {
    const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
      const startTime = Date.now();
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        callback(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    };

    animateValue(0, analyticsData.studyStreak, 1000, (value) => 
      setAnimatedValues(prev => ({ ...prev, studyStreak: value }))
    );
    animateValue(0, analyticsData.totalXP, 1500, (value) => 
      setAnimatedValues(prev => ({ ...prev, totalXP: value }))
    );
    animateValue(0, analyticsData.cardsCompleted, 1200, (value) => 
      setAnimatedValues(prev => ({ ...prev, cardsCompleted: value }))
    );
    animateValue(0, analyticsData.averageScore, 1300, (value) => 
      setAnimatedValues(prev => ({ ...prev, averageScore: value }))
    );
  }, [analyticsData]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "🔥 Legendary Streak!";
    if (streak >= 14) return "⚡ Amazing Momentum!";
    if (streak >= 7) return "🚀 Great Consistency!";
    return "💪 Keep it up!";
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">Performance Analytics</h3>
          </div>
          <div className="text-right">
            <div className="text-white text-sm opacity-90">Level {analyticsData.level}</div>
            <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <FireIcon className="w-6 h-6 text-orange-600" />
              <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                STREAK
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{animatedValues.studyStreak}</div>
            <div className="text-sm text-orange-700">{getStreakMessage(analyticsData.studyStreak)}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <StarIcon className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                XP
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{animatedValues.totalXP.toLocaleString()}</div>
            <div className="text-sm text-blue-700">Total Experience</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <TrophyIcon className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                CARDS
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">{animatedValues.cardsCompleted}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <BoltIcon className="w-6 h-6 text-purple-600" />
              <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                SCORE
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{animatedValues.averageScore}%</div>
            <div className="text-sm text-purple-700">Average Score</div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-indigo-600" />
            <span>Weekly Progress</span>
          </h4>
          <div className="flex items-end justify-between h-32 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-4 border border-gray-200">
            {analyticsData.weeklyProgress.map((progress, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div 
                  className="w-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-1000 ease-out"
                  style={{ height: `${(progress / 100) * 80}px` }}
                />
                <span className="text-xs text-gray-600 font-medium">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths and Areas for Improvement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <h5 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5" />
              <span>Strength Areas</span>
            </h5>
            <div className="space-y-2">
              {analyticsData.strengthAreas.map((area, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-800">{area}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h5 className="font-semibold text-amber-900 mb-3 flex items-center space-x-2">
              <AcademicCapIcon className="w-5 h-5" />
              <span>Focus Areas</span>
            </h5>
            <div className="space-y-2">
              {analyticsData.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-amber-800">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
          <h5 className="font-semibold text-yellow-900 mb-3 flex items-center space-x-2">
            <StarIcon className="w-5 h-5 text-yellow-600" />
            <span>Recent Achievements</span>
          </h5>
          <div className="flex flex-wrap gap-2">
            {analyticsData.achievements.map((achievement, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-medium rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                🏆 {achievement}
              </span>
            ))}
          </div>
        </div>

        {/* Study Time */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
            <ClockIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">
              Total study time: <span className="font-semibold">{formatTime(analyticsData.timeSpent)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
