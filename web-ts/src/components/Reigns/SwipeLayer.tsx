import React, { useState, useRef, useCallback, useEffect } from 'react';

interface Choice {
  label: string;
  effects: Record<string, number>;
}

interface SwipeLayerProps {
  children: React.ReactNode;
  leftChoice: Choice;
  rightChoice: Choice;
  onChoice: (side: 'left' | 'right') => void;
}

const SwipeLayer: React.FC<SwipeLayerProps> = ({ 
  children, 
  leftChoice,
  rightChoice,
  onChoice 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [choicePreview, setChoicePreview] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const cardWidth = useRef(0);
  const rafPending = useRef(false);
  const lastClientX = useRef(0);

  const formatEffects = (effects: Record<string, number>): string => {
    return ['funds', 'reputation', 'readiness']
      .map((k) => {
        const v = effects[k];
        if (typeof v === 'number' && v !== 0) {
          return `${k[0].toUpperCase()}: ${v > 0 ? '+' : ''}${v}`;
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
  };

  const handleStart = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    cardWidth.current = rect.width;
    startX.current = clientX;
    setIsDragging(true);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    lastClientX.current = clientX;

    if (rafPending.current) return;
    rafPending.current = true;

    requestAnimationFrame(() => {
      rafPending.current = false;
      const deltaX = lastClientX.current - startX.current;
      setDragOffset(deltaX);

      // Show preview when dragged past 50px
      if (deltaX < -50) {
        setChoicePreview('left');
      } else if (deltaX > 50) {
        setChoicePreview('right');
      } else {
        setChoicePreview(null);
      }
    });
  }, [isDragging]);

  const handleEnd = useCallback((clientX: number) => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = clientX - startX.current;
    const threshold = cardWidth.current * 0.33;

    // Commit based on distance threshold only
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) {
        onChoice('left');
      } else {
        onChoice('right');
      }
    }

    // Reset with animation
    setDragOffset(0);
    setChoicePreview(null);
  }, [isDragging, onChoice]);

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  }, [handleStart]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const onMouseUp = useCallback((e: MouseEvent) => {
    handleEnd(e.clientX);
  }, [handleEnd]);

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleStart(e.touches[0].clientX);
    }
  }, [handleStart]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (e.changedTouches.length > 0) {
      handleEnd(e.changedTouches[0].clientX);
    }
  }, [handleEnd]);

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);

      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      };
    }
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onChoice('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onChoice('right');
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onChoice]);

  const cardStyle: React.CSSProperties = {
    transform: `translateX(${dragOffset}px) scale(${isDragging ? 0.98 : 1})`,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div className="relative select-none" ref={containerRef}>
      <div
        style={cardStyle}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {children}
      </div>

      {/* Choice Preview Overlay */}
      {choicePreview && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div
            className={`px-6 py-4 rounded-lg font-bold text-lg shadow-lg ${
              choicePreview === 'left'
                ? 'bg-red-500/90 text-white'
                : 'bg-green-500/90 text-white'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">
                {choicePreview === 'left' ? '←' : '→'}
              </div>
              <div className="text-sm font-semibold mb-2">
                {choicePreview === 'left' ? leftChoice.label : rightChoice.label}
              </div>
              <div className="text-xs opacity-90">
                {formatEffects(choicePreview === 'left' ? leftChoice.effects : rightChoice.effects)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeLayer;

