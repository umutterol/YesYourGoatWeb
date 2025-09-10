import React from 'react';
import { usePlatformFeatures } from '../../utils/platform';
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

interface CardProps {
  event: EventCard;
  onChoice: (side: 'left' | 'right') => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ event, onChoice, className = '' }) => {
  const { cardSize } = usePlatformFeatures();

  const cardClasses = `reigns-card ${
    cardSize === 'mobile' ? 'card-mobile' :
    cardSize === 'tablet' ? 'card-tablet' :
    cardSize === 'desktop' ? 'card-desktop' :
    'card-large'
  } p-6 ${className}`;

  return (
    <div className={cardClasses}>
      {/* Portrait and Speaker */}
      {(event.speaker || event.portrait) && (
        <div className="flex justify-center mb-6">
          <Portrait
            src={event.portrait}
            alt={event.speaker || 'Speaker'}
            speaker={event.speaker}
          />
        </div>
      )}

      {/* Event Title */}
      <div className="text-2xl font-bold text-center mb-6 text-[var(--reigns-text)]">
        {event.title}
      </div>

      {/* Event Body */}
      <div className="text-lg leading-relaxed mb-8 text-[var(--reigns-text-secondary)] flex-1 px-2">
        {event.body}
      </div>

      {/* Choice Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => onChoice('left')}
          className="reigns-button flex-1 group"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--reigns-danger)';
            e.currentTarget.style.borderColor = 'var(--reigns-danger)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--reigns-card)';
            e.currentTarget.style.borderColor = 'var(--reigns-border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span className="group-hover:text-white transition-colors">
            {event.left?.label || 'Left'}
          </span>
        </button>
        
        <button
          onClick={() => onChoice('right')}
          className="reigns-button flex-1 group"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--reigns-success)';
            e.currentTarget.style.borderColor = 'var(--reigns-success)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--reigns-card)';
            e.currentTarget.style.borderColor = 'var(--reigns-border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span className="group-hover:text-white transition-colors">
            {event.right?.label || 'Right'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Card;
