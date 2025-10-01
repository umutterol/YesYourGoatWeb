# Master Development Plan - YesYourGoat

## Overview
This is the single, consolidated plan for developing YesYourGoat across all platforms. The approach focuses on **PC-first development** with a clear progression: PC UI on web → Steam release → Mobile versions.

## Development Philosophy
- **Single Codebase**: One React/TypeScript codebase for all platforms
- **PC-First**: Start with PC UI optimized for web testing
- **Progressive Enhancement**: Add platform-specific features incrementally
- **Mock-First Development**: Test all features on web before platform integration

## Phase 1: PC UI on Web (Weeks 1-4)
*Target: Test complete PC experience on Vercel*

### Week 1: Core PC UI System
**Goal**: Create PC-optimized Reigns UI that works perfectly on web

#### 1.1 Visual Design System
```css
/* PC-optimized color palette */
:root {
  --reigns-bg: #1a1a1a;           /* Dark background */
  --reigns-card: #2d2d2d;         /* Card background */
  --reigns-text: #ffffff;         /* Primary text */
  --reigns-accent: #ff6b35;       /* Orange accent */
  --reigns-success: #4caf50;      /* Green for positive */
  --reigns-danger: #f44336;       /* Red for negative */
}
```

**Tasks:**
- [ ] Implement PC-optimized color palette and typography
- [ ] Create responsive card system (320px mobile → 560px desktop)
- [ ] Add portrait integration with circular cropping
- [ ] Implement PC-sized resource bars (80px height)
- [ ] Set up responsive breakpoints (mobile, tablet, desktop, large desktop)

#### 1.2 PC Input System
**Goal**: Perfect mouse and keyboard controls for PC experience

**Tasks:**
- [ ] Implement mouse drag detection with visual feedback
- [ ] Add keyboard controls (A/D, arrows, space, esc, tab)
- [ ] Create smooth card rotation and scaling effects
- [ ] Add choice preview system for mouse/keyboard
- [ ] Implement universal button fallback system

### Week 2: Card Physics & Animations
**Goal**: Smooth, responsive card interactions optimized for PC

**Tasks:**
- [ ] Create smooth card transitions (300ms ease-out)
- [ ] Add card stack visualization (next card 20% opacity)
- [ ] Implement card exit animations (slide out with rotation)
- [ ] Add PC-specific animations (higher frame rate support)
- [ ] Create choice preview system with direction indicators

### Week 3: Resource System & Mock Steam Features
**Goal**: Complete resource visualization + Steam UI testing

**Tasks:**
- [ ] Create animated progress bars with color coding
- [ ] Add resource change animations (flash effects)
- [ ] Implement critical state indicators (pulse effects)
- [ ] **Mock Steam Features**:
  - [ ] Achievement system with visual notifications
  - [ ] Cloud save system (localStorage fallback)
  - [ ] Steam overlay mock (Shift+Tab toggle)
  - [ ] Achievement unlock animations

### Week 4: Polish & Web Optimization
**Goal**: Perfect PC experience on web, ready for Steam conversion

**Tasks:**
- [ ] Add sound effects and audio system
- [ ] Implement portrait breathing animation
- [ ] Add special effects for different event types
- [ ] Optimize performance for web (60fps target)
- [ ] Add accessibility features (keyboard navigation)
- [ ] **Final Testing**: Complete PC experience on Vercel

**Deliverable**: Fully functional PC UI on web with mock Steam features

## Phase 2: Steam Release (Weeks 5-8)
*Target: Steam-ready desktop application*

### Week 5: Electron Integration
**Goal**: Convert web app to desktop application

**Tasks:**
- [ ] Add Electron to project
- [ ] Configure electron-builder for Steam
- [ ] Set up window management (800×600 to 1920×1080)
- [ ] Add desktop-specific features (minimize, maximize, close)
- [ ] Implement fullscreen toggle (F11)

### Week 6: Steam SDK Integration
**Goal**: Real Steam features replace mock implementations

**Tasks:**
- [ ] Integrate Steam SDK
- [ ] Replace mock achievements with real Steam achievements
- [ ] Replace mock cloud save with real Steam cloud saves
- [ ] Add real Steam overlay (Shift+Tab)
- [ ] Implement Steam Input for controller support

### Week 7: Steam-Specific Features
**Goal**: Complete Steam integration

**Tasks:**
- [ ] Add Steam achievements (10+ achievements)
- [ ] Implement Steam cloud save synchronization
- [ ] Add Steam overlay integration
- [ ] Create Steam-specific UI elements
- [ ] Add Steam Input controller support

### Week 8: Steam Optimization & Submission
**Goal**: Steam-ready build and submission

**Tasks:**
- [ ] Optimize performance for Steam (120fps support)
- [ ] Add Steam-specific settings menu
- [ ] Implement Steam pause system
- [ ] Create Steam build configuration
- [ ] **Steam Submission**: Submit to Steam Direct

**Deliverable**: Steam-ready desktop application

## Phase 3: Mobile Versions (Weeks 9-12)
*Target: iOS and Android applications*

### Week 9: Mobile UI Adaptation
**Goal**: Adapt PC UI for mobile screens

**Tasks:**
- [ ] Optimize card dimensions for mobile (320×480)
- [ ] Implement touch/swipe detection
- [ ] Add mobile-specific animations
- [ ] Optimize resource bars for mobile (60px height)
- [ ] Add mobile-specific breakpoints

### Week 10: Capacitor Integration
**Goal**: Convert to mobile applications

**Tasks:**
- [ ] Add Capacitor to project
- [ ] Configure iOS and Android builds
- [ ] Set up mobile-specific features
- [ ] Add haptic feedback support
- [ ] Implement mobile-specific audio

### Week 11: Mobile Platform Features
**Goal**: Platform-specific mobile features

**Tasks:**
- [ ] **iOS Features**:
  - [ ] Haptic feedback (iPhone 7+)
  - [ ] Dark mode support
  - [ ] Game Center integration
  - [ ] Accessibility (VoiceOver)
- [ ] **Android Features**:
  - [ ] Haptic feedback
  - [ ] Adaptive icons
  - [ ] Google Play Games
  - [ ] Accessibility (TalkBack)

### Week 12: Mobile Optimization & Submission
**Goal**: Mobile-ready builds and app store submission

**Tasks:**
- [ ] Optimize performance for mobile (60fps)
- [ ] Add mobile-specific settings
- [ ] Implement mobile pause system
- [ ] Create mobile build configurations
- [ ] **App Store Submission**: Submit to iOS App Store and Google Play

**Deliverable**: Mobile applications for iOS and Android

## Technical Implementation

### Core Architecture
```
YesYourGoat/
├── src/
│   ├── components/
│   │   ├── Card/           # Card system
│   │   ├── ResourceBar/    # Resource visualization
│   │   ├── Portrait/       # Portrait system
│   │   ├── Input/          # Input handling
│   │   ├── Steam/          # Steam features
│   │   └── UI/             # UI components
│   ├── hooks/
│   │   ├── usePlatform.ts  # Platform detection
│   │   └── useSteam.ts     # Steam integration
│   ├── utils/
│   │   ├── platform.ts     # Platform utilities
│   │   └── steam.ts        # Steam utilities
│   └── mocks/
│       └── steamAPI.ts     # Mock Steam API
```

### Platform Detection
```typescript
// utils/platform.ts
export const detectPlatform = () => ({
  isWeb: typeof window !== 'undefined' && !window.electron,
  isSteam: typeof window !== 'undefined' && window.steam,
  isMobile: /Android|iPhone|iPad/i.test(navigator.userAgent),
  hasSteamAPI: typeof window !== 'undefined' && window.steam?.api,
  hasGamepadAPI: 'getGamepads' in navigator,
  hasHapticAPI: 'vibrate' in navigator
});
```

### Feature Flags
```typescript
// hooks/usePlatformFeatures.ts
export const usePlatformFeatures = () => {
  const platform = detectPlatform();
  
  return {
    showSteamOverlay: platform.hasSteamAPI,
    showAchievements: platform.hasSteamAPI,
    enableController: platform.hasGamepadAPI,
    enableHaptic: platform.hasHapticAPI,
    enableHighRefresh: !platform.isMobile
  };
};
```

## Build Configuration

### Development Scripts
```json
{
  "scripts": {
    "dev": "vite --mode web",
    "dev:steam": "vite --mode steam",
    "dev:mobile": "vite --mode mobile",
    "build": "vite build --mode web",
    "build:steam": "vite build --mode steam",
    "build:mobile": "vite build --mode mobile"
  }
}
```

### Environment Modes
- **Web Mode**: PC UI with mock Steam features (Vercel)
- **Steam Mode**: Desktop app with real Steam integration
- **Mobile Mode**: Mobile app with platform-specific features

## Testing Strategy

### Phase 1 Testing (Web)
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] PC input methods (mouse, keyboard)
- [ ] Mock Steam features functionality
- [ ] Performance testing (60fps target)
- [ ] Accessibility testing

### Phase 2 Testing (Steam)
- [ ] Windows, macOS, Linux compatibility
- [ ] Real Steam integration testing
- [ ] Controller support testing
- [ ] Performance testing (120fps target)
- [ ] Steam overlay functionality

### Phase 3 Testing (Mobile)
- [ ] iOS and Android device testing
- [ ] Touch input testing
- [ ] Haptic feedback testing
- [ ] Performance testing (60fps target)
- [ ] App store compliance testing

## Success Metrics

### Phase 1 (Web)
- [ ] 95% visual similarity to Reigns
- [ ] Smooth 60fps animations
- [ ] < 100ms response time for interactions
- [ ] < 2s initial load time
- [ ] Complete PC experience on web

### Phase 2 (Steam)
- [ ] 120fps support on high-refresh monitors
- [ ] < 5% performance impact from Steam overlay
- [ ] Full Steam feature integration
- [ ] Steam store page ready
- [ ] Steam Direct submission approved

### Phase 3 (Mobile)
- [ ] 60fps performance on mobile devices
- [ ] < 100MB app size
- [ ] Full mobile feature integration
- [ ] App store approval
- [ ] Cross-platform consistency

## Cost Analysis

### Development Costs
- **Steam**: $100 (Steam Direct fee)
- **iOS**: $99/year (Apple Developer Program)
- **Android**: $25 (Google Play Developer fee)
- **Total**: $224 first year, $99/year ongoing

### Additional Costs
- **Assets**: $500-2000 (icons, screenshots, trailers)
- **Legal**: $1000-3000 (privacy policy, terms of service)
- **Marketing**: $1000-5000 (store optimization, promotion)
- **Total**: $2500-10000

## Risk Mitigation

### Technical Risks
- **Low Risk**: Current codebase is well-suited for all platforms
- **Medium Risk**: Platform-specific optimization requirements
- **High Risk**: App store approval process

### Mitigation Strategies
- [ ] Early testing on all target platforms
- [ ] Following platform guidelines strictly
- [ ] Maintaining platform-specific documentation
- [ ] Regular testing and optimization

## Conclusion

This master plan provides a clear, focused approach to developing YesYourGoat across all platforms:

1. **Phase 1**: Perfect PC UI on web with mock Steam features
2. **Phase 2**: Convert to Steam desktop application
3. **Phase 3**: Adapt to mobile platforms

The key advantages:
- **Single codebase** for all platforms
- **PC-first development** with web testing
- **Progressive enhancement** for platform-specific features
- **Mock-first approach** for rapid iteration
- **Clear progression** from web to Steam to mobile

This approach ensures quality, consistency, and efficiency while minimizing development costs and complexity.
