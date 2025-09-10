import React, { useState, useRef, useCallback } from 'react';

interface CardPhysicsProps {
  children: React.ReactNode;
  onChoice: (side: 'left' | 'right') => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const CardPhysics: React.FC<CardPhysicsProps> = ({ 
  children, 
  onChoice, 
  onDragStart,
  onDragEnd 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Calculate rotation based on horizontal movement (max 15 degrees)
    const maxRotation = 15;
    const rotationAmount = Math.max(-maxRotation, Math.min(maxRotation, deltaX * 0.1));
    setRotation(rotationAmount);
    
    // Calculate scale based on drag distance (slight scale down)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 200;
    const scaleAmount = Math.max(0.95, 1 - (distance / maxDistance) * 0.05);
    setScale(scaleAmount);
    
    // Update drag offset for visual feedback
    setDragOffset({ x: deltaX, y: deltaY });
  }, [isDragging]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    onDragEnd?.();
    
    // Reset cursor
    document.body.style.cursor = 'default';
    
    // Calculate if we should trigger a choice
    const deltaX = e.clientX - (startPos.current.x + (cardRef.current?.getBoundingClientRect().left || 0));
    const deltaY = e.clientY - (startPos.current.y + (cardRef.current?.getBoundingClientRect().top || 0));
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const dragDuration = Date.now() - dragStartTime.current;
    
    // Trigger choice if dragged far enough or fast enough
    const threshold = 100;
    const velocityThreshold = 500; // pixels per second
    const velocity = distance / (dragDuration / 1000); // pixels per second
    
    if (distance > threshold || (distance > 50 && velocity > velocityThreshold)) {
      if (deltaX < -threshold / 2) {
        onChoice('left');
      } else if (deltaX > threshold / 2) {
        onChoice('right');
      }
    }
    
    // Reset card position with animation
    setDragOffset({ x: 0, y: 0 });
    setRotation(0);
    setScale(1);
  }, [isDragging, onChoice, onDragEnd]);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const cardStyle: React.CSSProperties = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${scale})`,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
    cursor: isDragging ? 'grabbing' : 'grab',
    transformOrigin: 'center center',
  };

  return (
    <div
      ref={cardRef}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      className="select-none"
    >
      {children}
    </div>
  );
};

export default CardPhysics;
