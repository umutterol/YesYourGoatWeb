import React, { useEffect, useState } from 'react';

interface ResourceAnimationsProps {
  funds: number;
  reputation: number;
  readiness: number;
  previousFunds?: number;
  previousReputation?: number;
  previousReadiness?: number;
}

const ResourceAnimations: React.FC<ResourceAnimationsProps> = ({
  funds,
  reputation,
  readiness,
  previousFunds,
  previousReputation,
  previousReadiness
}) => {
  const [animations, setAnimations] = useState<{
    funds: { show: boolean; change: number; type: 'positive' | 'negative' | 'neutral' };
    reputation: { show: boolean; change: number; type: 'positive' | 'negative' | 'neutral' };
    readiness: { show: boolean; change: number; type: 'positive' | 'negative' | 'neutral' };
  }>({
    funds: { show: false, change: 0, type: 'neutral' },
    reputation: { show: false, change: 0, type: 'neutral' },
    readiness: { show: false, change: 0, type: 'neutral' }
  });

  useEffect(() => {
    if (previousFunds !== undefined && previousFunds !== funds) {
      const change = funds - previousFunds;
      setAnimations(prev => ({
        ...prev,
        funds: {
          show: true,
          change,
          type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
        }
      }));

      // Hide animation after 1.5 seconds
      setTimeout(() => {
        setAnimations(prev => ({
          ...prev,
          funds: { show: false, change: 0, type: 'neutral' }
        }));
      }, 1500);
    }
  }, [funds, previousFunds]);

  useEffect(() => {
    if (previousReputation !== undefined && previousReputation !== reputation) {
      const change = reputation - previousReputation;
      setAnimations(prev => ({
        ...prev,
        reputation: {
          show: true,
          change,
          type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
        }
      }));

      setTimeout(() => {
        setAnimations(prev => ({
          ...prev,
          reputation: { show: false, change: 0, type: 'neutral' }
        }));
      }, 1500);
    }
  }, [reputation, previousReputation]);

  useEffect(() => {
    if (previousReadiness !== undefined && previousReadiness !== readiness) {
      const change = readiness - previousReadiness;
      setAnimations(prev => ({
        ...prev,
        readiness: {
          show: true,
          change,
          type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
        }
      }));

      setTimeout(() => {
        setAnimations(prev => ({
          ...prev,
          readiness: { show: false, change: 0, type: 'neutral' }
        }));
      }, 1500);
    }
  }, [readiness, previousReadiness]);

  const getAnimationClass = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-400 animate-pulse';
      case 'negative':
        return 'text-red-400 animate-pulse';
      default:
        return 'text-yellow-400 animate-pulse';
    }
  };

  const getChangeIcon = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      default:
        return '=';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {animations.funds.show && (
        <div className={`bg-[var(--reigns-card)] border border-[var(--reigns-border)] rounded-lg px-3 py-2 ${getAnimationClass(animations.funds.type)}`}>
          <span className="font-bold">💰 {animations.funds.change > 0 ? '+' : ''}{animations.funds.change}</span>
          <span className="ml-2">{getChangeIcon(animations.funds.type)}</span>
        </div>
      )}
      
      {animations.reputation.show && (
        <div className={`bg-[var(--reigns-card)] border border-[var(--reigns-border)] rounded-lg px-3 py-2 ${getAnimationClass(animations.reputation.type)}`}>
          <span className="font-bold">⭐ {animations.reputation.change > 0 ? '+' : ''}{animations.reputation.change}</span>
          <span className="ml-2">{getChangeIcon(animations.reputation.type)}</span>
        </div>
      )}
      
      {animations.readiness.show && (
        <div className={`bg-[var(--reigns-card)] border border-[var(--reigns-border)] rounded-lg px-3 py-2 ${getAnimationClass(animations.readiness.type)}`}>
          <span className="font-bold">⚔️ {animations.readiness.change > 0 ? '+' : ''}{animations.readiness.change}</span>
          <span className="ml-2">{getChangeIcon(animations.readiness.type)}</span>
        </div>
      )}
    </div>
  );
};

export default ResourceAnimations;
