import React from 'react';
import { usePlatformFeatures } from '../../utils/platform';

interface PortraitProps {
  src?: string;
  alt: string;
  speaker?: string;
  className?: string;
}

const Portrait: React.FC<PortraitProps> = ({ 
  src, 
  alt, 
  speaker, 
  className = '' 
}) => {
  const { portraitSize } = usePlatformFeatures();

  const portraitClasses = `reigns-portrait ${
    portraitSize === 'mobile' ? 'portrait-mobile' : 'portrait-desktop'
  } ${className}`;


  return (
    <div className="flex flex-col items-center gap-3">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={portraitClasses}
          onError={(e) => {
            // Replace with fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}
      
      {/* Fallback portrait (hidden by default) */}
      <div 
        className={portraitClasses}
        style={{ display: src ? 'none' : 'flex' }}
      >
        <span className="text-2xl">👤</span>
      </div>
      
      {speaker && (
        <div className="text-center">
          <div className="text-sm font-medium text-[var(--reigns-text-secondary)]">
            {speaker}
          </div>
        </div>
      )}
    </div>
  );
};

export default Portrait;
