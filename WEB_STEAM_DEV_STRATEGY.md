# Web vs Steam Development Strategy

## Overview
This document outlines the development approach for maintaining both web and Steam versions of YesYourGoat, with a focus on testing Steam UI features on Vercel without Steam integration.

## Development Approach: Single Codebase, Multiple Builds

### Core Strategy
- **Single Codebase**: One React/TypeScript codebase for all platforms
- **Platform Detection**: Runtime detection of platform capabilities
- **Feature Flags**: Conditional rendering based on platform support
- **Build Targets**: Different build configurations for web vs Steam

## 1. Platform Detection System

### 1.1 Runtime Platform Detection
```typescript
// utils/platform.ts
export interface PlatformCapabilities {
  isWeb: boolean;
  isSteam: boolean;
  isMobile: boolean;
  hasSteamAPI: boolean;
  hasGamepadAPI: boolean;
  hasHapticAPI: boolean;
}

export const detectPlatform = (): PlatformCapabilities => {
  return {
    isWeb: typeof window !== 'undefined' && !window.electron,
    isSteam: typeof window !== 'undefined' && window.steam,
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    hasSteamAPI: typeof window !== 'undefined' && window.steam?.api,
    hasGamepadAPI: 'getGamepads' in navigator,
    hasHapticAPI: 'vibrate' in navigator
  };
};
```

### 1.2 Feature Flag System
```typescript
// hooks/usePlatformFeatures.ts
export const usePlatformFeatures = () => {
  const platform = detectPlatform();
  
  return {
    // UI Features
    showSteamOverlay: platform.hasSteamAPI,
    showAchievements: platform.hasSteamAPI,
    showCloudSave: platform.hasSteamAPI,
    
    // Input Features
    enableController: platform.hasGamepadAPI,
    enableHaptic: platform.hasHapticAPI,
    
    // Performance Features
    enableHighRefresh: !platform.isMobile,
    enableAdvancedGraphics: !platform.isMobile,
    
    // Audio Features
    enableSpatialAudio: !platform.isMobile,
    enableAdvancedAudio: !platform.isMobile
  };
};
```

## 2. Steam UI Testing on Vercel

### 2.1 Mock Steam API for Development
```typescript
// mocks/steamAPI.ts
export const mockSteamAPI = {
  // Achievement System
  achievements: {
    unlock: (id: string) => {
      console.log(`[MOCK] Achievement unlocked: ${id}`);
      // Show achievement notification in UI
      showAchievementNotification(id);
    },
    getAchievements: () => [
      { id: 'first_choice', name: 'First Choice', description: 'Make your first choice' },
      { id: 'survivor', name: 'Survivor', description: 'Survive 10 days' }
    ]
  },
  
  // Cloud Save System
  cloudSave: {
    save: (data: any) => {
      console.log('[MOCK] Cloud save:', data);
      // Use localStorage as fallback
      localStorage.setItem('yyg_cloud_save', JSON.stringify(data));
    },
    load: () => {
      console.log('[MOCK] Cloud load');
      // Use localStorage as fallback
      return JSON.parse(localStorage.getItem('yyg_cloud_save') || '{}');
    }
  },
  
  // Overlay System
  overlay: {
    isEnabled: () => true,
    show: () => console.log('[MOCK] Steam overlay shown'),
    hide: () => console.log('[MOCK] Steam overlay hidden')
  }
};

// Use mock API when Steam API is not available
export const getSteamAPI = () => {
  if (typeof window !== 'undefined' && window.steam?.api) {
    return window.steam.api;
  }
  return mockSteamAPI;
};
```

### 2.2 Steam UI Components with Fallbacks
```typescript
// components/Steam/AchievementSystem.tsx
export const AchievementSystem = () => {
  const { showAchievements } = usePlatformFeatures();
  const steamAPI = getSteamAPI();
  
  if (!showAchievements) return null;
  
  return (
    <div className="achievement-system">
      <AchievementNotifications />
      <AchievementList />
    </div>
  );
};

// components/Steam/AchievementNotifications.tsx
export const AchievementNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Listen for achievement unlocks
    const handleAchievement = (achievementId: string) => {
      setNotifications(prev => [...prev, { id: achievementId, timestamp: Date.now() }]);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== achievementId));
      }, 3000);
    };
    
    // This works on both real Steam and mock API
    window.addEventListener('achievementUnlocked', handleAchievement);
    return () => window.removeEventListener('achievementUnlocked', handleAchievement);
  }, []);
  
  return (
    <div className="achievement-notifications">
      {notifications.map(notification => (
        <AchievementToast key={notification.id} achievementId={notification.id} />
      ))}
    </div>
  );
};
```

## 3. Development Workflow

### 3.1 Local Development
```bash
# Web development (Vercel-compatible)
npm run dev

# Steam development (with Electron)
npm run dev:steam

# Mobile development (with Capacitor)
npm run dev:mobile
```

### 3.2 Build Configurations
```json
// package.json
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

### 3.3 Environment Configuration
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const config = {
    web: {
      define: {
        __PLATFORM__: '"web"',
        __STEAM_API__: 'false'
      }
    },
    steam: {
      define: {
        __PLATFORM__: '"steam"',
        __STEAM_API__: 'true'
      }
    },
    mobile: {
      define: {
        __PLATFORM__: '"mobile"',
        __STEAM_API__: 'false'
      }
    }
  };
  
  return config[mode] || config.web;
});
```

## 4. Testing Strategy

### 4.1 Web Testing (Vercel)
- **Steam UI Components**: All Steam UI components render with mock data
- **Achievement System**: Mock achievements work with visual notifications
- **Cloud Save**: Uses localStorage as fallback
- **Controller Support**: Gamepad API works in supported browsers
- **Steam Overlay**: Mock overlay that shows/hides (no real Steam integration)

### 4.2 Steam Testing (Local)
- **Real Steam API**: Full Steam integration when running in Electron
- **Achievement System**: Real Steam achievements
- **Cloud Save**: Real Steam cloud saves
- **Steam Overlay**: Real Steam overlay integration
- **Steam Input**: Real controller support

### 4.3 Cross-Platform Testing
```typescript
// tests/platform.test.ts
describe('Platform Detection', () => {
  it('detects web platform correctly', () => {
    const platform = detectPlatform();
    expect(platform.isWeb).toBe(true);
    expect(platform.hasSteamAPI).toBe(false);
  });
  
  it('uses mock Steam API on web', () => {
    const steamAPI = getSteamAPI();
    expect(steamAPI).toBeDefined();
    expect(steamAPI.achievements.unlock).toBeDefined();
  });
});
```

## 5. Steam-Specific Features on Web

### 5.1 Achievements (Mock)
- **Visual Notifications**: Toast notifications for achievement unlocks
- **Achievement List**: View all available achievements
- **Progress Tracking**: Track progress toward achievements
- **Sound Effects**: Achievement unlock sounds

### 5.2 Cloud Save (Mock)
- **Local Storage**: Uses localStorage as fallback
- **Sync Indicators**: Visual feedback for save operations
- **Conflict Resolution**: Handle save conflicts (future feature)

### 5.3 Steam Overlay (Mock)
- **Overlay Toggle**: Show/hide mock overlay
- **Overlay Content**: Friends list, guides, achievements
- **Keyboard Shortcut**: Shift+Tab to toggle overlay

### 5.4 Controller Support (Real)
- **Gamepad API**: Real controller support in supported browsers
- **Input Mapping**: Customizable button mappings
- **Visual Feedback**: Controller button prompts

## 6. Deployment Strategy

### 6.1 Web Deployment (Vercel)
```bash
# Deploy web version to Vercel
npm run build
vercel deploy
```
- **Features**: All Steam UI components with mock functionality
- **Testing**: Full Steam UI testing without Steam integration
- **Performance**: Optimized for web browsers

### 6.2 Steam Deployment (Electron)
```bash
# Build Steam version
npm run build:steam
npm run electron:build
```
- **Features**: Full Steam integration
- **Distribution**: Steam Direct submission
- **Performance**: Optimized for desktop

## 7. Development Benefits

### 7.1 Single Codebase
- **Consistency**: Same UI/UX across all platforms
- **Maintenance**: One codebase to maintain
- **Testing**: Test Steam features on web before Steam deployment

### 7.2 Rapid Iteration
- **Web Testing**: Test Steam UI changes instantly on Vercel
- **No Steam Required**: Develop Steam features without Steam client
- **Cross-Platform**: Test on multiple platforms simultaneously

### 7.3 Cost Effective
- **No Steam Dev Account**: Test Steam features without Steam dev account
- **Free Hosting**: Use Vercel for testing and demos
- **Easy Sharing**: Share Steam UI with others via web link

## 8. Implementation Timeline

### Phase 1: Platform Detection (Week 1)
- [ ] Implement platform detection system
- [ ] Create feature flag system
- [ ] Add mock Steam API
- [ ] Test platform detection on web

### Phase 2: Steam UI Components (Week 2)
- [ ] Create achievement system components
- [ ] Implement cloud save components
- [ ] Add Steam overlay mock
- [ ] Test all components on web

### Phase 3: Integration Testing (Week 3)
- [ ] Test Steam UI on Vercel
- [ ] Verify mock functionality
- [ ] Test controller support
- [ ] Cross-platform testing

### Phase 4: Steam Integration (Week 4)
- [ ] Add real Steam API integration
- [ ] Test on Steam client
- [ ] Deploy to Steam
- [ ] Final testing and optimization

## 9. Conclusion

**Yes, you can absolutely test Steam UI on Vercel!** 

The key is using a **single codebase with platform detection and mock APIs**. This approach allows you to:

- **Develop Steam features on web** without Steam integration
- **Test Steam UI components** on Vercel with mock data
- **Maintain consistency** across all platforms
- **Iterate rapidly** without Steam dev account requirements
- **Share demos** easily via web links

The mock Steam API provides all the visual and functional aspects of Steam features, so you can develop and test the complete Steam experience on Vercel before adding real Steam integration.
