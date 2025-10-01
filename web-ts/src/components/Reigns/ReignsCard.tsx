import React from 'react';

interface Choice {
  label: string;
  effects: Record<string, number>;
}

interface ReignsCardProps {
  title: string;
  body: string;
  speaker?: string;
  portrait?: string;
  left: Choice;
  right: Choice;
  onChoice: (side: 'left' | 'right') => void;
}

const ReignsCard: React.FC<ReignsCardProps> = ({
  title,
  body,
  speaker,
  portrait,
  left,
  right,
  onChoice
}) => {
  return (
    <div className="bg-[var(--reigns-card)] rounded-2xl shadow-2xl border-2 border-[var(--reigns-border)] p-8 max-w-md w-full">
      {/* Portrait and Speaker */}
      {(speaker || portrait) && (
        <div className="flex flex-col items-center mb-6">
          <img
            src={portrait || '/resources/portraits/paladin.png'}
            alt={speaker || 'Speaker'}
            className="w-24 h-24 rounded-full border-4 border-[var(--reigns-border)] mb-3"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = '/resources/portraits/paladin.png';
            }}
          />
          {speaker && (
            <div className="text-sm font-semibold text-[var(--reigns-text-secondary)] uppercase tracking-wide">
              {speaker}
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <h2 className="text-2xl font-bold text-center mb-4 text-[var(--reigns-text)] leading-tight">
        {title}
      </h2>

      {/* Body */}
      <p className="text-lg text-center mb-8 text-[var(--reigns-text-secondary)] leading-relaxed min-h-[4rem]">
        {body}
      </p>

      {/* Choices */}
      <div className="flex gap-4">
        <button
          onClick={() => onChoice('left')}
          className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-[var(--reigns-danger)] hover:bg-[var(--reigns-danger)]/80 border-2 border-[var(--reigns-danger)] transition-all duration-200 hover:scale-105 active:scale-95 min-h-[44px]"
        >
          {left.label}
        </button>
        
        <button
          onClick={() => onChoice('right')}
          className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-[var(--reigns-success)] hover:bg-[var(--reigns-success)]/80 border-2 border-[var(--reigns-success)] transition-all duration-200 hover:scale-105 active:scale-95 min-h-[44px]"
        >
          {right.label}
        </button>
      </div>
    </div>
  );
};

export default ReignsCard;

