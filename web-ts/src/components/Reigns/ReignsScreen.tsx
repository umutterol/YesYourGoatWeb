import React from 'react';
import ResourceBar from '../ResourceBar/ResourceBar';
import ResourceAnimations from '../ResourceBar/ResourceAnimations';
import SwipeLayer from './SwipeLayer';
import ReignsCard from './ReignsCard';

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

interface ReignsScreenProps {
  meters: { funds: number; reputation: number; readiness: number };
  previousMeters?: { funds: number; reputation: number; readiness: number };
  currentEvent: EventCard | null;
  onChoice: (side: 'left' | 'right') => void;
  showSummary?: boolean;
  summaryContent?: React.ReactNode;
}

const ReignsScreen: React.FC<ReignsScreenProps> = ({
  meters,
  previousMeters,
  currentEvent,
  onChoice,
  showSummary = false,
  summaryContent
}) => {
  return (
    <div className="min-h-screen w-full bg-[var(--reigns-bg)] text-[var(--reigns-text)] flex flex-col">
      {/* Resource Bar */}
      <div className="p-4">
        <ResourceBar
          funds={meters.funds}
          reputation={meters.reputation}
          readiness={meters.readiness}
        />
      </div>

      {/* Resource Change Animations */}
      <ResourceAnimations
        funds={meters.funds}
        reputation={meters.reputation}
        readiness={meters.readiness}
        previousFunds={previousMeters?.funds}
        previousReputation={previousMeters?.reputation}
        previousReadiness={previousMeters?.readiness}
      />

      {/* Main Card Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {currentEvent ? (
          <SwipeLayer
            leftChoice={currentEvent.left}
            rightChoice={currentEvent.right}
            onChoice={onChoice}
          >
            <ReignsCard
              title={currentEvent.title}
              body={currentEvent.body}
              speaker={currentEvent.speaker}
              portrait={currentEvent.portrait}
              left={currentEvent.left}
              right={currentEvent.right}
              onChoice={onChoice}
            />
          </SwipeLayer>
        ) : (
          <div className="text-center text-[var(--reigns-text-secondary)]">
            Loading...
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {showSummary && summaryContent}
    </div>
  );
};

export default ReignsScreen;

