import React from 'react';

interface JourneyTrackProps {
  milestones: number[];
  currentDay: number;
  journeyCount: number;
  className?: string;
}

const JourneyTrack: React.FC<JourneyTrackProps> = ({ 
  milestones, 
  currentDay, 
  journeyCount, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-2 mb-6 ${className}`}>
      {milestones.map((milestone, index) => {
        const isReached = index < journeyCount;
        const isCurrent = currentDay >= milestone && !isReached;
        
        return (
          <div key={milestone} className="flex items-center gap-2">
            <div 
              className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                isReached 
                  ? 'bg-[var(--reigns-accent)] border-[var(--reigns-accent)] shadow-lg' 
                  : isCurrent
                  ? 'bg-[var(--reigns-warning)] border-[var(--reigns-warning)] animate-pulse'
                  : 'bg-[var(--reigns-card)] border-[var(--reigns-border)]'
              }`}
            />
            {index < milestones.length - 1 && (
              <div 
                className={`w-8 h-[2px] transition-all duration-300 ${
                  isReached 
                    ? 'bg-[var(--reigns-accent)]' 
                    : 'bg-[var(--reigns-border)]'
                }`} 
              />
            )}
          </div>
        );
      })}
      
      {/* Journey progress text */}
      <div className="ml-4 text-sm text-[var(--reigns-text-secondary)]">
        <span className="font-mono font-bold text-[var(--reigns-accent)]">
          {journeyCount}
        </span>
        <span className="mx-1">/</span>
        <span className="font-mono">{milestones.length}</span>
        <span className="ml-1">milestones</span>
      </div>
    </div>
  );
};

export default JourneyTrack;
