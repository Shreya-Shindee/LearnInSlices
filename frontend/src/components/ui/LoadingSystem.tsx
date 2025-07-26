import React from 'react';
import { Loader2, BookOpen } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variantClasses = {
    default: 'text-gray-500',
    primary: 'text-primary-500',
    secondary: 'text-secondary-500'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} 
    />
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: 'default' | 'minimal' | 'branded';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  variant = 'default'
}) => {
  if (!isVisible) return null;

  const renderContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="flex items-center space-x-3">
            <LoadingSpinner size="lg" variant="primary" />
            <span className="text-gray-700 font-medium">{message}</span>
          </div>
        );

      case 'branded':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <div className="w-4 h-4 bg-accent-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">LearnInSlices</h3>
              <p className="text-gray-600">{message}</p>
            </div>
            <div className="flex justify-center">
              <LoadingSpinner size="lg" variant="primary" />
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-auto">
            <div className="text-center space-y-4">
              <LoadingSpinner size="xl" variant="primary" />
              <p className="text-gray-700 font-medium">{message}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {renderContent()}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could be enhanced with custom wave animation
    none: ''
  };

  return (
    <div 
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${animationClasses[animation]} 
        ${className}
      `} 
    />
  );
};

interface CardSkeletonProps {
  showImage?: boolean;
  lines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showImage = true,
  lines = 3
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      {showImage && (
        <Skeleton variant="rectangular" className="w-full h-48" />
      )}
      
      <div className="space-y-3">
        <Skeleton variant="text" className="w-3/4 h-6" />
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton 
            key={i} 
            variant="text" 
            className={`${i === lines - 1 ? 'w-1/2' : 'w-full'} h-4`} 
          />
        ))}
      </div>
      
      <div className="flex space-x-2">
        <Skeleton variant="rectangular" className="w-20 h-8" />
        <Skeleton variant="rectangular" className="w-16 h-8" />
      </div>
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'md',
  showPercentage = false,
  animated = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`space-y-1 ${className}`}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`
            ${sizeClasses[size]} 
            ${variantClasses[variant]} 
            rounded-full 
            transition-all 
            duration-300 
            ease-out
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

interface SmartLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({
  isLoading,
  children,
  fallback,
  delay = 200
}) => {
  const [showLoading, setShowLoading] = React.useState(false);

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (isLoading) {
      timeout = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, delay]);

  if (isLoading && showLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        {fallback || <LoadingSpinner size="lg" variant="primary" />}
      </div>
    );
  }

  return <>{children}</>;
};
