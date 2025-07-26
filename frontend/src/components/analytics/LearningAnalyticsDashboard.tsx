import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  AcademicCapIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useProgressStore } from '../../store/progressStore';

interface LearningAnalyticsDashboardProps {
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface LearningMetrics {
  totalTimeSpent: number;
  cardsCompleted: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: number;
  strongestSubjects: string[];
  weakestSubjects: string[];
  learningVelocity: number;
  consistencyScore: number;
}

const LearningAnalyticsDashboard: React.FC<LearningAnalyticsDashboardProps> = () => {
  const { userStats, insights, generateInsights } = useProgressStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'insights' | 'goals'>('overview');
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateInsights();
    calculateMetrics();
  }, [selectedPeriod, generateInsights]);

  const calculateMetrics = () => {
    setIsLoading(true);
    
    // Simulate metrics calculation
    setTimeout(() => {
      const mockMetrics: LearningMetrics = {
        totalTimeSpent: userStats.total_time_studied || 0,
        cardsCompleted: userStats.cards_mastered || 0,
        averageAccuracy: userStats.average_accuracy || 0,
        currentStreak: userStats.current_streak || 0,
        longestStreak: userStats.longest_streak || 0,
        weeklyProgress: Math.random() * 100,
        strongestSubjects: ['JavaScript', 'React', 'TypeScript'],
        weakestSubjects: ['Node.js', 'MongoDB'],
        learningVelocity: Math.random() * 5 + 2, // 2-7 cards per day
        consistencyScore: Math.random() * 40 + 60 // 60-100%
      };
      
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 500);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getMetricCard = (
    title: string,
    value: string | number,
    icon: React.ComponentType<any>,
    color: string,
    trend?: 'up' | 'down' | 'stable',
    subtitle?: string
  ) => {
    const Icon = icon;
    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      stable: 'text-gray-600'
    };
    
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className={`text-xs mt-1 ${trend ? trendColors[trend] : 'text-gray-500'}`}>
                {trend && (
                  <ArrowTrendingUpIcon 
                    className={`w-3 h-3 inline mr-1 ${
                      trend === 'down' ? 'rotate-180' : ''
                    }`} 
                  />
                )}
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const ProgressChart = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
      <div className="space-y-4">
        {/* Weekly progress visualization */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">This Week</span>
          <span className="text-sm font-medium text-gray-900">
            {metrics?.weeklyProgress.toFixed(0)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${metrics?.weeklyProgress || 0}%` }}
          />
        </div>
        
        {/* Subject breakdown */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Subject Mastery</h4>
          <div className="space-y-3">
            {metrics?.strongestSubjects.map((subject, index) => (
              <div key={subject} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{subject}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${90 - index * 10}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">
                    {90 - index * 10}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const InsightsPanel = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <StarIcon className="w-5 h-5 mr-2 text-yellow-500" />
        Learning Insights
      </h3>
      <div className="space-y-4">
        {insights.slice(0, 3).map((insight, index) => (
          <div 
            key={insight.type + index}
            className={`p-4 rounded-lg border-l-4 ${
              insight.type === 'strength' 
                ? 'border-green-500 bg-green-50' 
                : insight.type === 'weakness'
                ? 'border-orange-500 bg-orange-50'
                : 'border-blue-500 bg-blue-50'
            }`}
          >
            <h4 className="font-medium text-gray-900 capitalize">
              {insight.type} Area
            </h4>
            <p className="text-sm text-gray-700 mt-1">
              {insight.description}
            </p>
            {insight.actionable && (
              <p className="text-xs text-gray-600 mt-2 italic">
                💡 Suggested Action Available
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const StudyHeatmap = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeks = 4;
    
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CalendarDaysIcon className="w-5 h-5 mr-2 text-purple-500" />
          Study Activity
        </h3>
        <div className="grid grid-cols-8 gap-2 text-xs">
          <div></div>
          {days.map(day => (
            <div key={day} className="text-center text-gray-500 font-medium">
              {day}
            </div>
          ))}
          {Array.from({ length: weeks }, (_, weekIndex) => (
            <React.Fragment key={weekIndex}>
              <div className="text-gray-500 font-medium">W{weekIndex + 1}</div>
              {days.map((day, dayIndex) => {
                const intensity = Math.random();
                const colorClass = 
                  intensity > 0.8 ? 'bg-green-600' :
                  intensity > 0.6 ? 'bg-green-500' :
                  intensity > 0.4 ? 'bg-green-300' :
                  intensity > 0.2 ? 'bg-green-200' :
                  'bg-gray-100';
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-6 h-6 rounded ${colorClass} border border-gray-200 hover:scale-110 transition-transform cursor-pointer`}
                    title={`${day} - ${Math.round(intensity * 100)}% activity`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Less active</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
            <div className="w-3 h-3 rounded bg-green-200 border border-gray-200" />
            <div className="w-3 h-3 rounded bg-green-300 border border-gray-200" />
            <div className="w-3 h-3 rounded bg-green-500 border border-gray-200" />
            <div className="w-3 h-3 rounded bg-green-600 border border-gray-200" />
          </div>
          <span>More active</span>
        </div>
      </div>
    );
  };

  if (isLoading || !metrics) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-gray-500 mt-4">Analyzing your learning patterns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Learning Analytics</h2>
          <p className="text-gray-600">
            Insights into your learning journey and progress patterns
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="quarter">Past Quarter</option>
          </select>
          
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'performance', label: 'Performance', icon: TrophyIcon },
            { id: 'insights', label: 'Insights', icon: StarIcon },
            { id: 'goals', label: 'Goals', icon: AcademicCapIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getMetricCard(
              'Total Study Time',
              formatDuration(metrics.totalTimeSpent),
              ClockIcon,
              'bg-gradient-to-r from-blue-500 to-blue-600',
              'up',
              '+15% from last month'
            )}
            
            {getMetricCard(
              'Cards Completed',
              metrics.cardsCompleted.toLocaleString(),
              AcademicCapIcon,
              'bg-gradient-to-r from-green-500 to-green-600',
              'up',
              '+24 this week'
            )}
            
            {getMetricCard(
              'Current Streak',
              `${metrics.currentStreak} days`,
              FireIcon,
              'bg-gradient-to-r from-orange-500 to-red-600',
              metrics.currentStreak > 5 ? 'up' : 'stable',
              `Best: ${metrics.longestStreak} days`
            )}
            
            {getMetricCard(
              'Accuracy Rate',
              `${metrics.averageAccuracy.toFixed(0)}%`,
              TrophyIcon,
              'bg-gradient-to-r from-purple-500 to-purple-600',
              metrics.averageAccuracy > 80 ? 'up' : 'down',
              'Above average'
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressChart />
            <StudyHeatmap />
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Trends
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <ChartBarIcon className="w-12 h-12 mr-3" />
                  <span>Interactive performance chart would go here</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Learning Velocity
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {metrics.learningVelocity.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">cards per day</div>
                  <div className="mt-4 text-xs text-gray-500">
                    Optimal range: 3-5 cards/day
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Consistency Score
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {metrics.consistencyScore.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">study consistency</div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${metrics.consistencyScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <InsightsPanel />
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personalized Recommendations
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <AcademicCapIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Focus on Weak Areas
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Consider spending more time on {metrics.weakestSubjects.join(' and ')} 
                    to improve overall comprehension.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <ClockIcon className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">
                    Optimal Study Time
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your peak performance appears to be in the morning. 
                    Consider scheduling challenging topics then.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Learning Goals
            </h3>
            <p className="text-gray-600 mb-6">
              Set and track your learning objectives to maintain motivation and measure progress.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    Complete Frontend Track
                  </h4>
                  <span className="text-sm text-gray-600">75% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full w-3/4" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Target: End of next month
                </p>
              </div>
              
              <Button variant="outline" className="w-full">
                Set New Goal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningAnalyticsDashboard;
