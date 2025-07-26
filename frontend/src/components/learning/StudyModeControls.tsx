import React, { useState, useEffect, useRef } from 'react';
import {
  BoltIcon,
  PauseIcon,
  PlayIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsRightLeftIcon,
  AcademicCapIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

interface StudyModeControlsProps {
  isActive: boolean;
  onToggle: () => void;
  totalCards: number;
  currentIndex: number;
  onNext: () => void;
  onModeChange: (mode: StudyModeType) => void;
}

type StudyModeType = 'normal' | 'speed' | 'focus' | 'review' | 'drill';

interface StudyModeSettings {
  mode: StudyModeType;
  autoAdvance: boolean;
  autoAdvanceDelay: number; // seconds
  showTimer: boolean;
  hideControls: boolean;
  audioEnabled: boolean;
  speedMultiplier: number;
  focusMode: boolean;
  reviewMode: boolean;
}

const StudyModeControls: React.FC<StudyModeControlsProps> = ({
  isActive,
  onToggle,
  totalCards,
  currentIndex,
  onNext,
  onModeChange
}) => {
  const [settings, setSettings] = useState<StudyModeSettings>({
    mode: 'normal',
    autoAdvance: false,
    autoAdvanceDelay: 5,
    showTimer: true,
    hideControls: false,
    audioEnabled: false,
    speedMultiplier: 1,
    focusMode: false,
    reviewMode: false
  });

  const [sessionTimer, setSessionTimer] = useState(0);
  const [cardTimer, setCardTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);

  const sessionIntervalRef = useRef<number | null>(null);
  const cardIntervalRef = useRef<number | null>(null);
  const autoAdvanceRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      // Session timer
      sessionIntervalRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);

      // Card timer
      cardIntervalRef.current = setInterval(() => {
        setCardTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
      if (cardIntervalRef.current) clearInterval(cardIntervalRef.current);
    }

    return () => {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
      if (cardIntervalRef.current) clearInterval(cardIntervalRef.current);
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    // Reset card timer when card changes
    setCardTimer(0);
    setAutoAdvanceCountdown(0);

    // Start auto-advance if enabled
    if (settings.autoAdvance && isActive && !isPaused) {
      setAutoAdvanceCountdown(settings.autoAdvanceDelay);
      
      countdownRef.current = setInterval(() => {
        setAutoAdvanceCountdown(prev => {
          if (prev <= 1) {
            onNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      autoAdvanceRef.current = setTimeout(() => {
        onNext();
      }, settings.autoAdvanceDelay * 1000);
    }

    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [currentIndex, settings.autoAdvance, settings.autoAdvanceDelay, isActive, isPaused, onNext]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (mode: StudyModeType) => {
    const newSettings = { ...settings, mode };
    
    // Apply mode-specific settings
    switch (mode) {
      case 'speed':
        newSettings.autoAdvance = true;
        newSettings.autoAdvanceDelay = 3;
        newSettings.speedMultiplier = 1.5;
        break;
      case 'focus':
        newSettings.hideControls = true;
        newSettings.focusMode = true;
        newSettings.showTimer = false;
        break;
      case 'review':
        newSettings.reviewMode = true;
        newSettings.autoAdvance = false;
        newSettings.showTimer = true;
        break;
      case 'drill':
        newSettings.autoAdvance = true;
        newSettings.autoAdvanceDelay = 2;
        newSettings.speedMultiplier = 2;
        break;
      default:
        newSettings.autoAdvance = false;
        newSettings.hideControls = false;
        newSettings.focusMode = false;
        newSettings.reviewMode = false;
        newSettings.speedMultiplier = 1;
    }

    setSettings(newSettings);
    onModeChange(mode);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };

  const handleSettingToggle = (setting: keyof StudyModeSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof StudyModeSettings]
    }));
  };

  const getModeIcon = (mode: StudyModeType) => {
    switch (mode) {
      case 'speed': return BoltIcon;
      case 'focus': return EyeIcon;
      case 'review': return ArrowsRightLeftIcon;
      case 'drill': return AcademicCapIcon;
      default: return StarIcon;
    }
  };

  const getModeColor = (mode: StudyModeType) => {
    switch (mode) {
      case 'speed': return 'from-yellow-500 to-orange-600';
      case 'focus': return 'from-purple-500 to-indigo-600';
      case 'review': return 'from-blue-500 to-cyan-600';
      case 'drill': return 'from-red-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!isActive) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BoltIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Enhanced Study Mode</h3>
              <p className="text-sm text-gray-600">
                Activate for focused learning with advanced features
              </p>
            </div>
          </div>
          <Button onClick={onToggle} className="bg-gradient-to-r from-primary-500 to-secondary-500">
            Activate Study Mode
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-gradient-to-r ${getModeColor(settings.mode)} rounded-lg`}>
              {React.createElement(getModeIcon(settings.mode), {
                className: "w-5 h-5 text-white"
              })}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 capitalize">
                {settings.mode} Study Mode
              </h3>
              <p className="text-sm text-gray-600">
                Card {currentIndex + 1} of {totalCards}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
            >
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Mode Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['normal', 'speed', 'focus', 'review', 'drill'] as StudyModeType[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                      settings.mode === mode
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-advance Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-advance
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => handleSettingToggle('autoAdvance')}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg border ${
                    settings.autoAdvance
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {settings.autoAdvance ? 'ON' : 'OFF'}
                </button>
                {settings.autoAdvance && (
                  <select
                    value={settings.autoAdvanceDelay}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoAdvanceDelay: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                  >
                    <option value={2}>2 sec</option>
                    <option value={3}>3 sec</option>
                    <option value={5}>5 sec</option>
                    <option value={10}>10 sec</option>
                  </select>
                )}
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => handleSettingToggle('showTimer')}
                  className={`w-full flex items-center justify-center px-2 py-1 text-xs rounded ${
                    settings.showTimer ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <ClockIcon className="w-3 h-3 mr-1" />
                  Timer
                </button>
                <button
                  onClick={() => handleSettingToggle('audioEnabled')}
                  className={`w-full flex items-center justify-center px-2 py-1 text-xs rounded ${
                    settings.audioEnabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {settings.audioEnabled ? (
                    <SpeakerWaveIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <SpeakerXMarkIcon className="w-3 h-3 mr-1" />
                  )}
                  Audio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Study Controls */}
      {!settings.hideControls && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Timer Display */}
            {settings.showTimer && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  <span>Session: {formatTime(sessionTimer)}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <span>Card: {formatTime(cardTimer)}</span>
                </div>
              </div>
            )}

            {/* Auto-advance Countdown */}
            {settings.autoAdvance && autoAdvanceCountdown > 0 && !isPaused && (
              <div className="flex items-center space-x-2 text-sm text-orange-600">
                <span>Next in {autoAdvanceCountdown}s</span>
                <div className="w-8 h-8 relative">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-orange-200"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${88 * (1 - autoAdvanceCountdown / settings.autoAdvanceDelay)} 88`}
                      className="text-orange-500"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseResume}
                className="flex items-center space-x-1"
              >
                {isPaused ? (
                  <>
                    <PlayIcon className="w-4 h-4" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <PauseIcon className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                )}
              </Button>

              {settings.focusMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings(prev => ({ ...prev, hideControls: !prev.hideControls }))}
                  className="flex items-center space-x-1"
                >
                  {settings.hideControls ? (
                    <EyeIcon className="w-4 h-4" />
                  ) : (
                    <EyeSlashIcon className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Progress: {Math.round(((currentIndex + 1) / totalCards) * 100)}%
          </span>
          <span>
            Avg. time per card: {sessionTimer > 0 ? formatTime(Math.round(sessionTimer / (currentIndex + 1))) : '0:00'}
          </span>
          <span>
            Mode: {settings.mode} 
            {settings.speedMultiplier > 1 && ` (${settings.speedMultiplier}x)`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudyModeControls;
