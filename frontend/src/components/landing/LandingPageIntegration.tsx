import React from 'react';
import { ExternalLink, Play, Star, Users, BookOpen, Brain, Zap, Trophy } from 'lucide-react';

interface LandingPageIntegrationProps {
  onShowDemo: () => void;
}

export const LandingPageIntegration: React.FC<LandingPageIntegrationProps> = ({ onShowDemo }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Logo and Branding */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-400 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  LearnInSlices
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Master any skill in <span className="font-semibold text-primary-600">3 minutes daily</span> with 
                AI-powered microlearning that adapts to your pace
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onShowDemo}
                className="group bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Try Interactive Demo</span>
              </button>
              
              <a
                href="http://localhost:8000"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary-300 flex items-center space-x-2"
              >
                <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Award-Winning Landing Page</span>
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span>Join 1000+ learners</span>
              </div>
              
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose LearnInSlices?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the perfect blend of AI technology and proven learning science
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 100} />
          ))}
        </div>
      </div>

      {/* Integration Showcase */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dual Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose between our interactive React demo or award-winning animated landing page
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* React App Demo */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Interactive Demo</h3>
                    <p className="text-gray-600">React-powered learning experience</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>Enhanced micro-card viewer</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>Real-time progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>Gamification features</span>
                  </div>
                </div>

                <button
                  onClick={onShowDemo}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  Launch Interactive Demo
                </button>
              </div>
            </div>

            {/* Landing Page */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Landing Page</h3>
                    <p className="text-gray-600">Award-worthy animations & design</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>GSAP-powered animations</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>Interactive demos</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>Performance optimized</span>
                  </div>
                </div>

                <a
                  href="http://localhost:8000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-[1.02] text-center"
                >
                  View Landing Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary-600">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  return (
    <div 
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

const features = [
  {
    icon: <Brain className="w-6 h-6 text-primary-600" />,
    title: "AI-Powered Content",
    description: "Smart algorithms generate personalized micro-cards from any topic, adapting to your learning style and pace."
  },
  {
    icon: <Zap className="w-6 h-6 text-secondary-600" />,
    title: "Spaced Repetition",
    description: "Science-backed review scheduling using SM2 and Leitner algorithms for maximum retention."
  },
  {
    icon: <Trophy className="w-6 h-6 text-accent-600" />,
    title: "Gamification",
    description: "XP points, achievement badges, and social leaderboards keep you motivated and engaged."
  },
  {
    icon: <Users className="w-6 h-6 text-primary-600" />,
    title: "Peer Learning",
    description: "Study rooms, challenges, and collaborative features connect you with fellow learners."
  },
  {
    icon: <BookOpen className="w-6 h-6 text-secondary-600" />,
    title: "Multiple Formats",
    description: "Interactive cards, videos, quizzes, and practice exercises for comprehensive learning."
  },
  {
    icon: <Star className="w-6 h-6 text-accent-600" />,
    title: "Progress Analytics",
    description: "Detailed insights into your learning patterns, strengths, and areas for improvement."
  }
];

const stats = [
  { value: "3min", label: "Daily Sessions" },
  { value: "95%", label: "Retention Rate" },
  { value: "1000+", label: "Active Learners" },
  { value: "50+", label: "Topics Available" }
];
