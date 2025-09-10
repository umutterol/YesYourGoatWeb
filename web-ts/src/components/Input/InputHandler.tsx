import React, { useEffect, useCallback } from 'react';
import { usePlatformFeatures } from '../../utils/platform';

interface InputHandlerProps {
  onChoice: (side: 'left' | 'right') => void;
  onSkip?: () => void;
  onPause?: () => void;
  children: React.ReactNode;
}

const InputHandler: React.FC<InputHandlerProps> = ({ 
  onChoice, 
  onSkip, 
  onPause, 
  children 
}) => {
  const { enableKeyboard, enableMouse } = usePlatformFeatures();

  // Keyboard controls
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enableKeyboard) return;

    switch (event.key.toLowerCase()) {
      case 'a':
      case 'arrowleft':
        event.preventDefault();
        onChoice('left');
        break;
      case 'd':
      case 'arrowright':
        event.preventDefault();
        onChoice('right');
        break;
      case ' ':
        event.preventDefault();
        onSkip?.();
        break;
      case 'escape':
        event.preventDefault();
        onPause?.();
        break;
    }
  }, [enableKeyboard, onChoice, onSkip, onPause]);

  // Mouse drag controls
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!enableMouse) return;

    const startX = event.clientX;
    const startY = event.clientY;
    let isDragging = false;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 10) {
        isDragging = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const threshold = 100; // Minimum drag distance

      if (Math.abs(deltaX) > threshold) {
        if (deltaX < 0) {
          onChoice('left');
        } else {
          onChoice('right');
        }
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [enableMouse, onChoice]);

  useEffect(() => {
    if (enableKeyboard) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableKeyboard, handleKeyDown]);

  return (
    <div 
      onMouseDown={handleMouseDown}
      className="select-none"
      style={{ cursor: enableMouse ? 'grab' : 'default' }}
    >
      {children}
    </div>
  );
};

export default InputHandler;
