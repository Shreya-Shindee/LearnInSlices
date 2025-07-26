import React, { useState } from 'react';
import { 
  SparklesIcon, 
  BeakerIcon, 
  RocketLaunchIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ChartBarIcon,
  UserGroupIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface AdvancedFeaturesProps {
  onFeatureSelect?: (feature: string) => void;
}

export const AdvancedFeatures: React.FC<AdvancedFeaturesProps> = ({ onFeatureSelect }) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'ai-tutor',
      name: 'AI Tutor',
      icon: SparklesIcon,
      description: 'Get personalized explanations and adaptive learning paths',
      color: 'from-purple-500 to-indigo-600',
      status: 'active'
    },
    {
      id: 'lab-mode',
      name: 'Interactive Labs',
      icon: BeakerIcon,
      description: 'Practice with hands-on coding environments',
      color: 'from-green-500 to-emerald-600',
      status: 'beta'
    },
    {
      id: 'speed-learning',
      name: 'Speed Learning',
      icon: RocketLaunchIcon,
      description: 'Accelerated learning with micro-bursts',
      color: 'from-orange-500 to-red-600',
      status: 'new'
    },
    {
      id: 'skill-tree',
      name: 'Skill Trees',
      icon: AcademicCapIcon,
      description: 'Visual progress tracking and skill unlocking',
      color: 'from-blue-500 to-cyan-600',
      status: 'active'
    },
    {
      id: 'smart-hints',
      name: 'Smart Hints',
      icon: LightBulbIcon,
      description: 'Context-aware assistance and tips',
      color: 'from-yellow-500 to-amber-600',
      status: 'active'
    },
    {
      id: 'analytics',
      name: 'Learning Analytics',
      icon: ChartBarIcon,
      description: 'Deep insights into your learning patterns',
      color: 'from-indigo-500 to-purple-600',
      status: 'pro'
    },
    {
      id: 'collaborative',
      name: 'Study Groups',
      icon: UserGroupIcon,
      description: 'Learn together with peers and mentors',
      color: 'from-pink-500 to-rose-600',
      status: 'active'
    },
    {
      id: 'achievements',
      name: 'Achievements',
      icon: TrophyIcon,
      description: 'Unlock badges and celebrate milestones',
      color: 'from-amber-500 to-yellow-600',
      status: 'active'
    }
  ];

  const handleFeatureClick = (feature: typeof features[0]) => {
    setActiveFeature(feature.id);
    onFeatureSelect?.(feature.id);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      beta: 'bg-blue-100 text-blue-800',
      new: 'bg-purple-100 text-purple-800',
      pro: 'bg-amber-100 text-amber-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <SparklesIcon className="w-6 h-6" />
          <span>Advanced Features</span>
        </h3>
        <p className="text-primary-100 text-sm mt-1">Unlock the full potential of AI-powered learning</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;
            
            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-[1.02] ${
                  isActive 
                    ? 'border-primary-300 bg-primary-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {feature.name}
                </h4>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                
                {isActive && (
                  <div className="absolute inset-0 border-2 border-primary-400 rounded-xl pointer-events-none animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
        
        {activeFeature && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
            <div className="flex items-center space-x-2 text-primary-700">
              <SparklesIcon className="w-5 h-5" />
              <span className="font-medium">
                {features.find(f => f.id === activeFeature)?.name} is now active!
              </span>
            </div>
            <p className="text-primary-600 text-sm mt-1">
              This feature will enhance your learning experience in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFeatures;
