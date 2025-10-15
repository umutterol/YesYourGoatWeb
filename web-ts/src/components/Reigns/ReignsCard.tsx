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
  body,
  speaker,
  left,
  right,
  onChoice
}) => {
  const [roster, setRoster] = useState<SpeakerRoster | null>(null);

  useEffect(() => {
    fetch('/roster.json')
      .then(r => r.json())
      .then(setRoster)
      .catch(err => console.error('Failed to load speaker roster:', err));
  }, []);

  const speakerData = speaker && roster?.speakers[speaker];

  return (
    <div className="bg-[var(--reigns-card)] rounded-2xl shadow-2xl border-2 border-[var(--reigns-border)] p-8 max-w-md w-full">
      {/* Event Body - At Top */}
      <p className="text-lg text-center mb-8 text-[var(--reigns-text)] leading-relaxed font-medium">
        {body}
      </p>

      {/* Portrait - Rectangle 300x300 */}
      {speaker && (
        <div className="flex flex-col items-center mb-6">
          <img
            src={speakerData ? speakerData.portrait : '/portraits/paladin.png'}
            alt={speakerData ? speakerData.name : speaker}
            className="w-[300px] h-[300px] object-cover border-4 border-[var(--reigns-border)] mb-4"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = '/portraits/paladin.png';
            }}
          />
          {/* Character Name */}
          <div className="text-center">
            <div className="text-lg font-bold text-[var(--reigns-text)] uppercase tracking-wide">
              {speakerData ? speakerData.name : speaker}
            </div>
          </div>
        </div>
      )}

      {/* Buttons - Both Same Color */}
      <div className="flex gap-4">
        <button
          onClick={() => onChoice('left')}
          className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-[var(--reigns-border)] hover:bg-[var(--reigns-border)]/80 border-2 border-[var(--reigns-border)] transition-all duration-200 hover:scale-105 active:scale-95 min-h-[44px]"
        >
          {left.label}
        </button>
        
        <button
          onClick={() => onChoice('right')}
          className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-[var(--reigns-border)] hover:bg-[var(--reigns-border)]/80 border-2 border-[var(--reigns-border)] transition-all duration-200 hover:scale-105 active:scale-95 min-h-[44px]"
        >
          {right.label}
        </button>
      </div>
    </div>
  );
};

export default ReignsCard;

