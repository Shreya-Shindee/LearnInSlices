import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { sampleLearningPaths } from '../../data/sampleData';
import type { LearningPath } from '../../types';

interface SkillSearchProps {
  onSelectPath: (pathId: string) => void;
  className?: string;
}

export const SkillSearch: React.FC<SkillSearchProps> = ({ 
  onSelectPath, 
  className = "" 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LearningPath[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const popularSkills = [
    'React', 'Python', 'JavaScript', 'Machine Learning', 'Data Science', 
    'UI/UX Design', 'Node.js', 'TypeScript', 'AWS', 'Photography'
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        const results = sampleLearningPaths.filter(path => 
          path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          path.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          path.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(results);
        setIsSearching(false);
        setShowSuggestions(true);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectPath = (path: LearningPath) => {
    setSearchQuery(path.title);
    setShowSuggestions(false);
    onSelectPath(path.id);
  };

  const handlePopularSkillClick = (skill: string) => {
    setSearchQuery(skill);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Search Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          What do you want to learn today?
        </h1>
        <p className="text-xl text-gray-600">
          Discover personalized learning paths powered by AI
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for any skill... (e.g., React, Python, Photography)"
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSuggestions && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-100">
              <div className="text-sm text-gray-600">
                Found {searchResults.length} learning path{searchResults.length !== 1 ? 's' : ''}
              </div>
            </div>
            {searchResults.map((path) => (
              <button
                key={path.id}
                onClick={() => handleSelectPath(path)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {path.title.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {path.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {path.description}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {path.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {path.difficulty_level}
                      </span>
                      <span className="text-xs text-gray-500">
                        ~{path.estimated_duration_hours}h
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {showSuggestions && searchResults.length === 0 && searchQuery.length > 2 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-6 text-center">
            <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No learning paths found
            </h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any paths for "{searchQuery}"
            </p>
            <button className="btn-primary">
              Request This Learning Path
            </button>
          </div>
        )}
      </div>

      {/* Popular Skills */}
      {!showSuggestions && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Skills
          </h3>
          <div className="flex flex-wrap gap-3">
            {popularSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => handlePopularSkillClick(skill)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!showSuggestions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all text-left">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Generated Path</h3>
            <p className="text-sm text-gray-600">
              Let AI create a custom learning path based on your goals
            </p>
          </button>
          
          <button className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:from-green-100 hover:to-green-200 transition-all text-left">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Browse Categories</h3>
            <p className="text-sm text-gray-600">
              Explore curated learning paths by topic and skill level
            </p>
          </button>
          
          <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all text-left">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Join Study Group</h3>
            <p className="text-sm text-gray-600">
              Learn together with peers in collaborative study sessions
            </p>
          </button>
        </div>
      )}
    </div>
  );
};
