# Reigns UI Replication Plan

## Overview
This document outlines a comprehensive plan to replicate the iconic Reigns UI design and functionality for the YesYourGoat game. The goal is to create an authentic Reigns-like experience with card-based interactions, smooth animations, and the signature visual style.

## Current State Analysis

### What We Have
- Basic React/TypeScript setup with Tailwind CSS
- Simple card layout with speaker/portrait display
- Basic swipe mechanics (touch and mouse)
- Resource meters (horizontal bars with icons)
- Event system with conversational dialog

### What We Need
- Complete visual overhaul to match Reigns aesthetic
- Enhanced card physics and animations
- Proper portrait integration and effects
- Improved resource visualization
- Better mobile responsiveness
- Sound effects and haptic feedback

## 1. Visual Design System

### 1.1 Color Palette
```css
/* Reigns-inspired color scheme */
:root {
  --reigns-bg: #1a1a1a;           /* Dark background */
  --reigns-card: #2d2d2d;         /* Card background */
  --reigns-text: #ffffff;         /* Primary text */
  --reigns-text-secondary: #cccccc; /* Secondary text */
  --reigns-accent: #ff6b35;       /* Orange accent */
  --reigns-success: #4caf50;      /* Green for positive */
  --reigns-danger: #f44336;       /* Red for negative */
  --reigns-warning: #ff9800;      /* Yellow for neutral */
  --reigns-border: #444444;       /* Subtle borders */
}
```

### 1.2 Typography
- **Primary Font**: System fonts (San Francisco, Segoe UI, Roboto)
- **Card Title**: 24px, bold, white
- **Card Body**: 18px, regular, light gray
- **Choice Labels**: 16px, medium, white
- **Resource Labels**: 14px, regular, muted

### 1.3 Spacing & Layout
- **Card Dimensions**: 320px × 480px (mobile), 400px × 600px (desktop)
- **Margins**: 20px around card
- **Padding**: 24px inside card
- **Resource Bar**: 60px height, full width
- **Portrait Size**: 120px × 120px (circular)

## 2. Card System Redesign

### 2.1 Card Structure
```
┌─────────────────────────────┐
│  [Resource Bar - Top]       │
├─────────────────────────────┤
│                             │
│    [Portrait - Center]      │
│                             │
│  [Speaker Name - Below]     │
│                             │
│  [Event Title - Bold]       │
│                             │
│  [Event Body - Paragraph]   │
│                             │
│  [Choice Buttons - Bottom]  │
│                             │
└─────────────────────────────┘
```

### 2.2 Card Physics & Animations
- **Swipe Detection**: 3-zone system (left, center, right)
- **Card Rotation**: Max 15° rotation during swipe
- **Card Scaling**: Slight scale down (0.95) when swiping
- **Smooth Transitions**: 300ms ease-out for all animations
- **Card Stack**: Next card visible behind current (20% opacity)
- **Card Exit**: Slide out with rotation and fade

### 2.3 Portrait Integration
- **Circular Cropping**: All portraits in perfect circles
- **Dynamic Effects**: Saturation changes based on resource levels
- **Portrait Border**: Subtle glow effect matching resource colors
- **Portrait Animation**: Gentle breathing effect (scale 1.0 → 1.02)
- **Fallback System**: Default portrait for missing images

## 3. Resource System Visualization

### 3.1 Resource Bar Design
```
┌─────────────────────────────────────┐
│ 💰 Funds    ⭐ Rep    ⚔️ Readiness  │
│ ████████░░  ██████░░░░  ████░░░░░░  │
│ 8/10        6/10        4/10        │
└─────────────────────────────────────┘
```

### 3.2 Resource Indicators
- **Icons**: Emoji-style icons for each resource
- **Progress Bars**: 10-segment bars with smooth fill animations
- **Color Coding**: 
  - Green (8-10): Healthy
  - Yellow (5-7): Warning
  - Red (0-4): Critical
- **Pulse Effect**: Red bars pulse when critical
- **Change Indicators**: +1/-2 animations on resource changes

### 3.3 Resource Change Animations
- **Positive Changes**: Green flash + upward arrow
- **Negative Changes**: Red flash + downward arrow
- **Neutral Changes**: Yellow flash + equal sign
- **Duration**: 1.5s animation with ease-out timing

## 4. Interaction System

### 4.1 Swipe Mechanics
- **Swipe Zones**: 
  - Left 33%: Negative choice
  - Center 34%: No action
  - Right 33%: Positive choice
- **Swipe Threshold**: 100px minimum distance
- **Velocity Detection**: Fast swipes trigger even with shorter distance
- **Haptic Feedback**: Vibration on successful swipe (mobile)
- **Visual Feedback**: Card follows finger/mouse with rotation

### 4.2 Button Fallback
- **Button Style**: Minimal, transparent with subtle borders
- **Hover Effects**: Slight scale up (1.05) and glow
- **Active States**: Scale down (0.95) with color change
- **Accessibility**: Full keyboard navigation support

### 4.3 Choice Preview
- **Swipe Preview**: Show choice label when swiping
- **Direction Indicators**: Subtle arrows showing swipe direction
- **Effect Preview**: Brief flash of resource changes
- **Confirmation**: Brief pause before executing choice

## 5. Mobile Optimization

### 5.1 Responsive Design
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Touch Targets**: Minimum 44px for all interactive elements
- **Safe Areas**: Respect device notches and home indicators
- **Orientation**: Support both portrait and landscape

### 5.2 Performance
- **Card Preloading**: Load next 2-3 cards in advance
- **Image Optimization**: WebP format with fallbacks
- **Animation Performance**: Use transform and opacity only
- **Memory Management**: Unload old cards after 10+ events

## 6. Audio & Haptic Feedback

### 6.1 Sound Effects
- **Card Swipe**: Subtle whoosh sound
- **Card Flip**: Paper rustle effect
- **Resource Change**: Soft chime for positive, thud for negative
- **Game Over**: Dramatic sound effect
- **Button Click**: Soft tap sound
- **Volume Control**: User-adjustable with mute option

### 6.2 Haptic Feedback (Mobile)
- **Light Swipe**: Light vibration
- **Heavy Swipe**: Medium vibration
- **Resource Critical**: Strong vibration
- **Game Over**: Long vibration pattern
- **Settings**: Respect system haptic preferences

## 7. Animation System

### 7.1 Card Transitions
- **Enter Animation**: Slide up from bottom with fade in
- **Exit Animation**: Slide out with rotation and fade
- **Stack Animation**: Next card slides up smoothly
- **Choice Animation**: Brief flash of choice effect

### 7.2 Resource Animations
- **Bar Fill**: Smooth progress bar animation
- **Change Flash**: Brief color flash on resource change
- **Critical Pulse**: Red bars pulse when below 3
- **Milestone Celebration**: Special animation for journey milestones

### 7.3 Portrait Effects
- **Breathing**: Subtle scale animation (1.0 → 1.02)
- **Resource Glow**: Border color changes with resource levels
- **Saturation**: Portrait desaturates when resources are low
- **Special Effects**: Unique effects for milestone events

## 8. Implementation Phases

### Phase 1: Core Visual System (Week 1)
- [ ] Implement color palette and typography
- [ ] Create card component with proper dimensions
- [ ] Add portrait integration with circular cropping
- [ ] Implement basic resource bar design
- [ ] Set up responsive breakpoints

### Phase 2: Card Physics & Animations (Week 2)
- [ ] Implement swipe detection system
- [ ] Add card rotation and scaling effects
- [ ] Create smooth card transitions
- [ ] Add card stack visualization
- [ ] Implement choice preview system

### Phase 3: Resource System (Week 3)
- [ ] Create animated progress bars
- [ ] Add resource change animations
- [ ] Implement color coding system
- [ ] Add critical state indicators
- [ ] Create milestone celebration effects

### Phase 4: Polish & Optimization (Week 4)
- [ ] Add sound effects and haptic feedback
- [ ] Implement portrait breathing animation
- [ ] Add special effects for different event types
- [ ] Optimize performance and memory usage
- [ ] Add accessibility features

## 9. Technical Implementation

### 9.1 Component Structure
```
YesYourGoat/
├── components/
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── CardPhysics.tsx
│   │   └── CardAnimations.tsx
│   ├── ResourceBar/
│   │   ├── ResourceBar.tsx
│   │   ├── ResourceIndicator.tsx
│   │   └── ResourceAnimations.tsx
│   ├── Portrait/
│   │   ├── Portrait.tsx
│   │   ├── PortraitEffects.tsx
│   │   └── PortraitFallback.tsx
│   └── SwipeHandler/
│       ├── SwipeHandler.tsx
│       ├── TouchHandler.tsx
│       └── MouseHandler.tsx
```

### 9.2 Animation Library
- **Framer Motion**: For complex animations and gestures
- **CSS Transitions**: For simple state changes
- **Web Animations API**: For performance-critical animations
- **Intersection Observer**: For scroll-based animations

### 9.3 State Management
- **Card State**: Current card, next card, animation state
- **Resource State**: Current values, change animations, critical states
- **Interaction State**: Swipe progress, choice preview, haptic feedback
- **Audio State**: Volume, mute, sound effects queue

## 10. Testing Strategy

### 10.1 Visual Testing
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Different screen sizes and orientations
- [ ] Accessibility testing (screen readers, keyboard navigation)

### 10.2 Performance Testing
- [ ] Animation frame rate (target: 60fps)
- [ ] Memory usage monitoring
- [ ] Battery impact testing (mobile)
- [ ] Network performance (image loading)

### 10.3 User Experience Testing
- [ ] Swipe gesture accuracy
- [ ] Touch target accessibility
- [ ] Audio/haptic feedback effectiveness
- [ ] Overall game flow and pacing

## 11. Success Metrics

### 11.1 Visual Fidelity
- [ ] 95% visual similarity to Reigns
- [ ] Smooth 60fps animations
- [ ] Consistent visual hierarchy
- [ ] Proper color contrast ratios

### 11.2 User Experience
- [ ] Intuitive swipe mechanics
- [ ] Responsive touch interactions
- [ ] Clear visual feedback
- [ ] Accessible design

### 11.3 Performance
- [ ] < 100ms response time for interactions
- [ ] < 2s initial load time
- [ ] < 50MB memory usage
- [ ] 60fps animation performance

## 12. Future Enhancements

### 12.1 Advanced Features
- [ ] Card customization (themes, colors)
- [ ] Advanced portrait effects (particles, filters)
- [ ] Gesture shortcuts (double-tap, long-press)
- [ ] Accessibility improvements (voice control)

### 12.2 Platform Integration
- [ ] PWA support (offline play)
- [ ] Social sharing features
- [ ] Achievement system
- [ ] Cloud save synchronization

---

## Conclusion

This plan provides a comprehensive roadmap for replicating the Reigns UI experience. The implementation will be done in phases to ensure quality and allow for iterative improvements. The focus is on creating an authentic, polished experience that captures the essence of Reigns while being optimized for web platforms.

The key to success will be attention to detail in animations, smooth interactions, and maintaining the signature Reigns aesthetic throughout the user experience.
