import React from 'react';
import { usePlatformFeatures } from '../../utils/platform';
import { getPortraitForSpeaker } from '../../utils/portraitMapping';

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

  const portraitClasses = `reigns-portrait breathing ${
    portraitSize === 'mobile' ? 'portrait-mobile' : 'portrait-desktop'
  } ${className}`;

  // Use provided src or get portrait from speaker mapping
  const portraitSrc = src || (speaker ? getPortraitForSpeaker(speaker) : getPortraitForSpeaker('Unknown'));

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={portraitSrc}
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
      
      {/* Fallback portrait (hidden by default) */}
      <div 
        className={portraitClasses}
        style={{ display: 'none' }}
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
