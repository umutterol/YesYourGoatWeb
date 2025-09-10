import React from 'react';
import { usePlatformFeatures } from '../../utils/platform';
import Card from './Card';
import Portrait from '../Portrait/Portrait';

interface Choice {
  label: string;
  effects: Record<string, number>;
}

interface EventCard {
  id: string;
  title: string;
  body: string;
  speaker?: string;
  portrait?: string;
  left: Choice;
  right: Choice;
}

interface CardStackProps {
  current: EventCard;
  next?: EventCard | null;
  onChoice: (side: 'left' | 'right') => void;
  className?: string;
}

const CardStack: React.FC<CardStackProps> = ({ 
  current, 
  next, 
  onChoice, 
  className = '' 
}) => {
  const { cardSize } = usePlatformFeatures();

  const cardClasses = `reigns-card ${
    cardSize === 'mobile' ? 'card-mobile' :
    cardSize === 'tablet' ? 'card-tablet' :
    cardSize === 'desktop' ? 'card-desktop' :
    'card-large'
  } p-6 ${className}`;

  return (
    <div className="relative">
      {/* Next card preview (behind current) */}
      {next && (
        <div 
          className={`${cardClasses} absolute top-2 left-2 opacity-20 z-0`}
          style={{ transform: 'scale(0.98)' }}
        >
          {/* Portrait and Speaker */}
          {(next.speaker || next.portrait) && (
            <div className="flex justify-center mb-6">
              <Portrait
                src={next.portrait}
                alt={next.speaker || 'Speaker'}
                speaker={next.speaker}
              />
            </div>
          )}

          {/* Event Title */}
          <div className="text-2xl font-bold text-center mb-6 text-[var(--reigns-text)]">
            {next.title}
          </div>

          {/* Event Body */}
          <div className="text-lg leading-relaxed mb-8 text-[var(--reigns-text-secondary)] flex-1 px-2">
            {next.body}
          </div>

          {/* Choice Buttons */}
          <div className="flex gap-4">
            <button className="reigns-button flex-1 opacity-50">
              {next.left?.label || 'Left'}
            </button>
            <button className="reigns-button flex-1 opacity-50">
              {next.right?.label || 'Right'}
            </button>
          </div>
        </div>
      )}

      {/* Current card (on top) */}
      <div className="relative z-10">
        <Card 
          event={current}
          onChoice={onChoice}
        />
      </div>
    </div>
  );
};

export default CardStack;
