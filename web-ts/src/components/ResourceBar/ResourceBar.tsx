import React from 'react';
import { usePlatformFeatures } from '../../utils/platform';

interface ResourceBarProps {
  funds: number;
  reputation: number;
  readiness: number;
  maxValue?: number;
}

const ResourceBar: React.FC<ResourceBarProps> = ({ 
  funds, 
  reputation, 
  readiness, 
  maxValue = 10 
}) => {
  const { cardSize } = usePlatformFeatures();

  const getResourceStatus = (value: number): 'healthy' | 'warning' | 'critical' => {
    if (value <= 3) return 'critical';
    if (value <= 6) return 'warning';
    return 'healthy';
  };

  const getResourceIcon = (type: string): string => {
    switch (type) {
      case 'funds': return '💰';
      case 'reputation': return '⭐';
      case 'readiness': return '⚔️';
      default: return '❓';
    }
  };

  const resources = [
    { key: 'funds', value: funds, label: 'Funds' },
    { key: 'reputation', value: reputation, label: 'Reputation' },
    { key: 'readiness', value: readiness, label: 'Readiness' }
  ];

  return (
    <div className={`resource-bar ${cardSize === 'mobile' ? 'h-16' : 'h-20'} p-6 mb-8`}>
      <div className="flex items-center justify-between h-full gap-6">
        {resources.map(({ key, value, label }) => {
          const percentage = (value / maxValue) * 100;
          const status = getResourceStatus(value);
          
          return (
            <div key={key} className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getResourceIcon(key)}</span>
                  <span className="text-sm font-medium text-[var(--reigns-text-secondary)]">
                    {label}
                  </span>
                </div>
                <span className="text-sm font-mono font-bold">
                  {value}/{maxValue}
                </span>
              </div>
              
              <div className="w-full bg-[var(--reigns-bg)] rounded-full overflow-hidden border border-[var(--reigns-border)]">
                <div 
                  className={`resource-fill ${status}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceBar;
