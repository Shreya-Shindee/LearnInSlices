import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon as UserCircleSolidIcon } from '@heroicons/react/24/solid';
import { ProgressAnalytics } from '../analytics';
import { useProgressStore } from '../../store';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose }) => {
  const { userStats, getStreakStatus } = useProgressStore();
  const streakStatus = getStreakStatus();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircleSolidIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
              <p className="text-sm text-gray-600">Level {userStats.current_level} Learner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {userStats.paths_completed}
              </div>
              <div className="text-xs text-gray-600">Paths Completed</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {userStats.cards_mastered}
              </div>
              <div className="text-xs text-gray-600">Cards Mastered</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {streakStatus.current}
              </div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(userStats.total_time_studied / 60)}h
              </div>
              <div className="text-xs text-gray-600">Hours Learned</div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Detailed Analytics</h3>
          <ProgressAnalytics className="space-y-4" />
        </div>
      </div>
    </>
  );
};
