# Reigns UI Replication Plan

## Overview
This document outlines a comprehensive plan to replicate the iconic Reigns UI design and functionality for the YesYourGoat game. The goal is to create an authentic Reigns-like experience with card-based interactions, smooth animations, and the signature visual style that works seamlessly across **PC (Steam), mobile (iOS/Android), and web platforms**.

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
- **Cross-platform input handling** (mouse, keyboard, touch, controller)
- **PC-optimized UI** with proper scaling and window management
- **Steam integration** (overlay, achievements, cloud saves)
- Sound effects and haptic feedback
- **Responsive design** for all screen sizes and orientations

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
- **Card Dimensions**: 
  - Mobile: 320px × 480px
  - Tablet: 400px × 600px  
  - Desktop: 480px × 720px
  - Large Desktop: 560px × 840px
- **Margins**: 20px around card (responsive)
- **Padding**: 24px inside card (responsive)
- **Resource Bar**: 60px height (mobile), 80px (desktop)
- **Portrait Size**: 120px × 120px (mobile), 160px × 160px (desktop)

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

## 4. Cross-Platform Interaction System

### 4.1 PC/Desktop Controls
- **Mouse Drag**: Primary interaction method
  - Click and drag to swipe cards
  - Visual feedback with cursor changes
  - Smooth mouse tracking with card rotation
- **Keyboard Controls**:
  - `A` / `Left Arrow`: Negative choice
  - `D` / `Right Arrow`: Positive choice
  - `Space`: Skip/continue
  - `Esc`: Pause menu
  - `Tab`: Cycle through UI elements
- **Controller Support** (Steam):
  - Left stick: Swipe simulation
  - `A` button: Positive choice
  - `X` button: Negative choice
  - `Start`: Pause menu
  - `Select`: Skip/continue

### 4.2 Mobile/Touch Controls
- **Swipe Mechanics**: 
  - Left 33%: Negative choice
  - Center 34%: No action
  - Right 33%: Positive choice
- **Swipe Threshold**: 100px minimum distance
- **Velocity Detection**: Fast swipes trigger even with shorter distance
- **Haptic Feedback**: Vibration on successful swipe
- **Visual Feedback**: Card follows finger with rotation

### 4.3 Universal Button Fallback
- **Button Style**: Minimal, transparent with subtle borders
- **Hover Effects**: Slight scale up (1.05) and glow (PC)
- **Active States**: Scale down (0.95) with color change
- **Accessibility**: Full keyboard navigation support
- **Touch Targets**: Minimum 44px for mobile accessibility

### 4.4 Choice Preview System
- **Mouse/Touch Preview**: Show choice label when dragging/swiping
- **Keyboard Preview**: Highlight choice on key press
- **Direction Indicators**: Subtle arrows showing direction
- **Effect Preview**: Brief flash of resource changes
- **Confirmation**: Brief pause before executing choice

## 5. PC/Steam UI Optimization

### 5.1 Desktop Window Management
- **Window Sizing**: 
  - Minimum: 800×600 (4:3 aspect ratio)
  - Default: 1200×800 (3:2 aspect ratio)
  - Maximum: 1920×1080 (16:9 aspect ratio)
- **Window Controls**: Standard minimize, maximize, close
- **Resizable**: Allow window resizing with content scaling
- **Fullscreen**: Toggle fullscreen mode (F11)
- **Multi-Monitor**: Support for multiple display setups

### 5.2 Steam Integration UI
- **Steam Overlay**: 
  - Accessible via Shift+Tab
  - Shows achievements, friends, guides
  - Non-intrusive during gameplay
- **Achievement Notifications**: 
  - Toast notifications in top-right corner
  - Steam-style achievement popup
  - Sound effect for achievement unlock
- **Cloud Save Indicator**: 
  - Subtle icon showing sync status
  - Visual feedback for save operations
- **Steam Input**: 
  - Controller configuration support
  - Customizable button mappings
  - Steam Deck optimization

### 5.3 PC-Specific Features
- **Settings Menu**: 
  - Graphics options (resolution, fullscreen, vsync)
  - Audio settings (master, SFX, music)
  - Input settings (keyboard, controller)
  - Steam integration toggles
- **Pause Menu**: 
  - Accessible via Esc key
  - Resume, Settings, Quit options
  - Steam overlay integration
- **Keyboard Shortcuts**: 
  - Full keyboard navigation
  - Customizable hotkeys
  - Accessibility support

## 6. Mobile Optimization

### 6.1 Responsive Design
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
  - Large Desktop: > 1440px
- **Touch Targets**: Minimum 44px for all interactive elements
- **Safe Areas**: Respect device notches and home indicators
- **Orientation**: Support both portrait and landscape

### 6.2 Performance
- **Card Preloading**: Load next 2-3 cards in advance
- **Image Optimization**: WebP format with fallbacks
- **Animation Performance**: Use transform and opacity only
- **Memory Management**: Unload old cards after 10+ events

## 7. Audio & Haptic Feedback

### 7.1 Sound Effects
- **Card Swipe**: Subtle whoosh sound
- **Card Flip**: Paper rustle effect
- **Resource Change**: Soft chime for positive, thud for negative
- **Game Over**: Dramatic sound effect
- **Button Click**: Soft tap sound
- **Achievement Unlock**: Steam-style achievement sound
- **Volume Control**: User-adjustable with mute option

### 7.2 Haptic Feedback (Mobile)
- **Light Swipe**: Light vibration
- **Heavy Swipe**: Medium vibration
- **Resource Critical**: Strong vibration
- **Game Over**: Long vibration pattern
- **Settings**: Respect system haptic preferences

### 7.3 PC Audio Features
- **Spatial Audio**: 3D positioning for immersive experience
- **Audio Device Selection**: Choose output device
- **Audio Mixing**: Separate channels for SFX, music, voice
- **Steam Audio**: Integration with Steam's audio system

## 8. Animation System

### 8.1 Card Transitions
- **Enter Animation**: Slide up from bottom with fade in
- **Exit Animation**: Slide out with rotation and fade
- **Stack Animation**: Next card slides up smoothly
- **Choice Animation**: Brief flash of choice effect
- **PC-Specific**: Higher frame rate (120fps) for high-refresh monitors

### 8.2 Resource Animations
- **Bar Fill**: Smooth progress bar animation
- **Change Flash**: Brief color flash on resource change
- **Critical Pulse**: Red bars pulse when below 3
- **Milestone Celebration**: Special animation for journey milestones
- **Steam Integration**: Achievement unlock animations

### 8.3 Portrait Effects
- **Breathing**: Subtle scale animation (1.0 → 1.02)
- **Resource Glow**: Border color changes with resource levels
- **Saturation**: Portrait desaturates when resources are low
- **Special Effects**: Unique effects for milestone events
- **PC Enhancement**: Higher resolution portraits, better filtering

### 8.4 PC-Specific Animations
- **Window Transitions**: Smooth minimize/maximize animations
- **Steam Overlay**: Fade in/out animations
- **Achievement Popup**: Steam-style notification animations
- **Settings Menu**: Slide-in panel animations
- **Controller Feedback**: Visual feedback for controller inputs

## 9. Implementation Phases

### Phase 1: Core Visual System (Week 1)
- [ ] Implement color palette and typography
- [ ] Create card component with proper dimensions (responsive)
- [ ] Add portrait integration with circular cropping
- [ ] Implement basic resource bar design
- [ ] Set up responsive breakpoints (mobile, tablet, desktop)
- [ ] **PC**: Add window management and scaling

### Phase 2: Cross-Platform Input System (Week 2)
- [ ] Implement mouse drag detection (PC)
- [ ] Add keyboard controls (PC)
- [ ] Implement touch/swipe detection (mobile)
- [ ] Add controller support (Steam)
- [ ] Create universal button fallback system
- [ ] Add choice preview system for all input methods

### Phase 3: Card Physics & Animations (Week 3)
- [ ] Add card rotation and scaling effects
- [ ] Create smooth card transitions
- [ ] Add card stack visualization
- [ ] Implement platform-specific animations
- [ ] **PC**: Add high-refresh rate support
- [ ] **Mobile**: Add haptic feedback

### Phase 4: Resource System & Steam Integration (Week 4)
- [ ] Create animated progress bars
- [ ] Add resource change animations
- [ ] Implement color coding system
- [ ] Add critical state indicators
- [ ] **Steam**: Add achievement system
- [ ] **Steam**: Add cloud save integration
- [ ] **Steam**: Add overlay support

### Phase 5: Polish & Platform Optimization (Week 5)
- [ ] Add sound effects and haptic feedback
- [ ] Implement portrait breathing animation
- [ ] Add special effects for different event types
- [ ] **PC**: Add settings menu and pause system
- [ ] **PC**: Add Steam-specific features
- [ ] Optimize performance for all platforms
- [ ] Add accessibility features

## 10. Technical Implementation

### 10.1 Component Structure
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
│   ├── Input/
│   │   ├── InputHandler.tsx
│   │   ├── MouseHandler.tsx
│   │   ├── TouchHandler.tsx
│   │   ├── KeyboardHandler.tsx
│   │   └── ControllerHandler.tsx
│   ├── Steam/
│   │   ├── SteamOverlay.tsx
│   │   ├── AchievementSystem.tsx
│   │   ├── CloudSave.tsx
│   │   └── SteamInput.tsx
│   └── UI/
│       ├── SettingsMenu.tsx
│       ├── PauseMenu.tsx
│       ├── WindowManager.tsx
│       └── PlatformDetector.tsx
```

### 10.2 Animation Library
- **Framer Motion**: For complex animations and gestures
- **CSS Transitions**: For simple state changes
- **Web Animations API**: For performance-critical animations
- **Intersection Observer**: For scroll-based animations
- **Steam Integration**: Steam SDK for achievement animations

### 10.3 State Management
- **Card State**: Current card, next card, animation state
- **Resource State**: Current values, change animations, critical states
- **Interaction State**: Swipe progress, choice preview, haptic feedback
- **Audio State**: Volume, mute, sound effects queue
- **Platform State**: Current platform, input method, Steam status
- **Steam State**: Achievements, cloud saves, overlay status

### 10.4 Platform-Specific Libraries
- **Steam SDK**: For Steam integration features
- **Electron**: For desktop app wrapper
- **Capacitor**: For mobile app wrapper
- **Gamepad API**: For controller support
- **Web Audio API**: For advanced audio features

## 11. Testing Strategy

### 11.1 Cross-Platform Testing
- [ ] **PC**: Windows, macOS, Linux compatibility
- [ ] **Mobile**: iOS, Android device testing
- [ ] **Web**: Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] **Steam**: Steam client integration testing
- [ ] Different screen sizes and orientations
- [ ] Accessibility testing (screen readers, keyboard navigation)

### 11.2 Input Method Testing
- [ ] **Mouse**: Drag detection, cursor feedback
- [ ] **Keyboard**: All hotkeys, navigation
- [ ] **Touch**: Swipe gestures, touch targets
- [ ] **Controller**: Steam Input, generic gamepad
- [ ] **Mixed Input**: Switching between input methods

### 11.3 Performance Testing
- [ ] Animation frame rate (target: 60fps, 120fps for PC)
- [ ] Memory usage monitoring
- [ ] Battery impact testing (mobile)
- [ ] Network performance (image loading)
- [ ] **Steam**: Overlay performance impact

### 11.4 User Experience Testing
- [ ] Swipe gesture accuracy
- [ ] Touch target accessibility
- [ ] Audio/haptic feedback effectiveness
- [ ] Overall game flow and pacing
- [ ] **Steam**: Achievement unlock flow
- [ ] **Steam**: Cloud save synchronization

## 12. Success Metrics

### 12.1 Visual Fidelity
- [ ] 95% visual similarity to Reigns
- [ ] Smooth 60fps animations (120fps on PC)
- [ ] Consistent visual hierarchy across platforms
- [ ] Proper color contrast ratios
- [ ] **PC**: High-resolution asset support

### 12.2 User Experience
- [ ] Intuitive input mechanics (touch, mouse, keyboard, controller)
- [ ] Responsive interactions across all platforms
- [ ] Clear visual feedback for all input methods
- [ ] Accessible design (WCAG 2.1 AA compliance)
- [ ] **Steam**: Seamless Steam integration

### 12.3 Performance
- [ ] < 100ms response time for interactions
- [ ] < 2s initial load time
- [ ] < 50MB memory usage (mobile), < 200MB (PC)
- [ ] 60fps animation performance (120fps on high-refresh PC)
- [ ] **Steam**: < 5% performance impact from Steam overlay

## 13. Future Enhancements

### 13.1 Advanced Features
- [ ] Card customization (themes, colors)
- [ ] Advanced portrait effects (particles, filters)
- [ ] Gesture shortcuts (double-tap, long-press)
- [ ] Accessibility improvements (voice control)
- [ ] **PC**: Advanced graphics settings (shadows, effects)

### 13.2 Platform Integration
- [ ] PWA support (offline play)
- [ ] Social sharing features
- [ ] **Steam**: Workshop support (custom events)
- [ ] **Steam**: Trading cards and badges
- [ ] **Steam**: Steam Broadcasting integration
- [ ] **Steam**: Steam Input advanced configuration

---

## Conclusion

This plan provides a comprehensive roadmap for replicating the Reigns UI experience across **PC (Steam), mobile (iOS/Android), and web platforms**. The implementation will be done in phases to ensure quality and allow for iterative improvements. The focus is on creating an authentic, polished experience that captures the essence of Reigns while being optimized for all target platforms.

### Key Success Factors:
- **Cross-Platform Consistency**: Maintain the same core experience across all platforms
- **Platform-Specific Optimization**: Leverage each platform's strengths (Steam features, mobile haptics, etc.)
- **Input Method Diversity**: Support mouse, keyboard, touch, and controller inputs seamlessly
- **Steam Integration**: Full Steam feature set for PC release
- **Performance**: 60fps on mobile, 120fps on high-refresh PC displays

The key to success will be attention to detail in animations, smooth interactions, and maintaining the signature Reigns aesthetic throughout the user experience while ensuring each platform feels native and optimized.
