import React, { useState, useRef, useCallback } from 'react';

interface CardPhysicsProps {
  children: React.ReactNode;
  onChoice: (side: 'left' | 'right') => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  showChoicePreview?: boolean;
  previewLeftText?: string;
  previewRightText?: string;
}

const CardPhysics: React.FC<CardPhysicsProps> = ({ 
  children, 
  onChoice, 
  onDragStart,
  onDragEnd,
  showChoicePreview = true,
  previewLeftText,
  previewRightText
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // const [rotation, setRotation] = useState(0); // Disabled for now
  const [scale, setScale] = useState(1);
  const [choicePreview, setChoicePreview] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const dragStartTime = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    setIsDragging(true);
    onDragStart?.();
    
    const rect = cardRef.current.getBoundingClientRect();
    startPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    dragStartTime.current = Date.now();
    
    // Add cursor style
    document.body.style.cursor = 'grabbing';
  }, [onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    // Rotation disabled for now
    // const maxRotation = 15;
    // const rotationAmount = Math.max(-maxRotation, Math.min(maxRotation, deltaX * 0.08));
    // setRotation(rotationAmount);
    
    // Calculate scale based on drag distance (slight scale down)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 200;
    const scaleAmount = Math.max(0.95, 1 - (distance / maxDistance) * 0.05);
    setScale(scaleAmount);
    
    // Update drag offset for visual feedback (limit to prevent extreme values)
    const maxOffset = 300;
    const limitedDeltaX = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
    const limitedDeltaY = Math.max(-maxOffset, Math.min(maxOffset, deltaY));
    setDragOffset({ x: limitedDeltaX, y: limitedDeltaY });

    // Show choice preview based on drag direction
    if (showChoicePreview) {
      if (limitedDeltaX < -50) {
        setChoicePreview('left');
      } else if (limitedDeltaX > 50) {
        setChoicePreview('right');
      } else {
        setChoicePreview(null);
      }
    }
  }, [isDragging]);

  const handleMouseUp = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    onDragEnd?.();
    
    // Reset cursor
    document.body.style.cursor = 'default';
    
    // Calculate if we should trigger a choice
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const clientX = (e as TouchEvent).changedTouches ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX;
    const deltaX = clientX - centerX;
    
    // Commit based on distance threshold only (>=33% of card width)
    const horizontalThreshold = rect.width * 0.33;
    if (Math.abs(deltaX) >= horizontalThreshold) {
      if (deltaX < 0) onChoice('left'); else onChoice('right');
    }
    
    // Reset card position with animation
    setDragOffset({ x: 0, y: 0 });
    // setRotation(0); // Disabled for now
    setScale(1);
    setChoicePreview(null);
  }, [isDragging, onChoice, onDragEnd]);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'a':
      case 'arrowleft':
        e.preventDefault();
        onChoice('left');
        break;
      case 'd':
      case 'arrowright':
        e.preventDefault();
        onChoice('right');
        break;
    }
  }, [onChoice]);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp as any);
      document.addEventListener('touchmove', handleMouseMove as any, { passive: false });
      document.addEventListener('touchend', handleMouseUp as any);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp as any);
        document.removeEventListener('touchmove', handleMouseMove as any);
        document.removeEventListener('touchend', handleMouseUp as any);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Add keyboard event listeners
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const cardStyle: React.CSSProperties = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${scale})`,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
    cursor: isDragging ? 'grabbing' : 'grab',
    transformOrigin: 'center center',
  };

  return (
    <div className="relative">
      <div
        ref={cardRef}
        style={cardStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={() => {
          if (!cardRef.current) return;
          setIsDragging(true);
          onDragStart?.();
          dragStartTime.current = Date.now();
          // Touch cursor unaffected
        }}
        className="select-none"
      >
        {children}
      </div>
      
      {/* Choice Preview Overlay */}
      {showChoicePreview && choicePreview && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className={`px-6 py-3 rounded-lg font-bold text-lg ${
            choicePreview === 'left' 
              ? 'bg-red-500/80 text-white' 
              : 'bg-green-500/80 text-white'
          }`}>
            {choicePreview === 'left' 
              ? (previewLeftText || '← Left Choice') 
              : (previewRightText || 'Right Choice →')}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPhysics;
