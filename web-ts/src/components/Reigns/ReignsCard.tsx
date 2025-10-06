import React, { useState, useEffect } from 'react';

interface Choice {
  label: string;
  effects: Record<string, number>;
}

interface Speaker {
  name: string;
  portrait: string;
  level: number;
  role: string;
  description: string;
}

interface SpeakerRoster {
  speakers: Record<string, Speaker>;
}

interface ReignsCardProps {
  title: string;
  body: string;
  speaker?: string;
  left: Choice;
  right: Choice;
  onChoice: (side: 'left' | 'right') => void;
}

const ReignsCard: React.FC<ReignsCardProps> = ({
  title,
  body,
  speaker,
  left,
  right,
  onChoice
}) => {
  const [roster, setRoster] = useState<SpeakerRoster | null>(null);

  useEffect(() => {
    fetch('/../resources/roster.json')
      .then(r => r.json())
      .then(setRoster)
      .catch(err => console.error('Failed to load speaker roster:', err));
  }, []);

  const speakerData = speaker && roster?.speakers[speaker];

  return (
    <div className="bg-[var(--reigns-card)] rounded-2xl shadow-2xl border-2 border-[var(--reigns-border)] p-8 max-w-md w-full">
      {/* Portrait and Speaker */}
      {speakerData && (
        <div className="flex flex-col items-center mb-6">
          <img
            src={speakerData.portrait}
            alt={speakerData.name}
            className="w-24 h-24 rounded-full border-4 border-[var(--reigns-border)] mb-3"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = '/resources/portraits/paladin.png';
            }}
          />
          <div className="text-center">
            <div className="text-sm font-semibold text-[var(--reigns-text-secondary)] uppercase tracking-wide">
              {speakerData.name}
            </div>
            <div className="text-xs text-[var(--reigns-text-secondary)] opacity-75">
              Level {speakerData.level} • {speakerData.role}
            </div>
          </div>
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

