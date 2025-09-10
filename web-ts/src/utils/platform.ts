// Platform detection and capabilities
export interface PlatformCapabilities {
  isWeb: boolean;
  isSteam: boolean;
  isMobile: boolean;
  hasSteamAPI: boolean;
  hasGamepadAPI: boolean;
  hasHapticAPI: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'large';
}

export const detectPlatform = (): PlatformCapabilities => {
  if (typeof window === 'undefined') {
    return {
      isWeb: true,
      isSteam: false,
      isMobile: false,
      hasSteamAPI: false,
      hasGamepadAPI: false,
      hasHapticAPI: false,
      screenSize: 'desktop'
    };
  }

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSteam = !!(window as any).steam;
  const hasSteamAPI = !!(window as any).steam?.api;
  const hasGamepadAPI = 'getGamepads' in navigator;
  const hasHapticAPI = 'vibrate' in navigator;

  // Determine screen size based on window width
  const width = window.innerWidth;
  let screenSize: 'mobile' | 'tablet' | 'desktop' | 'large';
  if (width < 768) {
    screenSize = 'mobile';
  } else if (width < 1024) {
    screenSize = 'tablet';
  } else if (width < 1440) {
    screenSize = 'desktop';
  } else {
    screenSize = 'large';
  }

  return {
    isWeb: !isSteam,
    isSteam,
    isMobile,
    hasSteamAPI,
    hasGamepadAPI,
    hasHapticAPI,
    screenSize
  };
};

// Feature flags based on platform capabilities
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
    enableMouse: !platform.isMobile,
    enableKeyboard: !platform.isMobile,
    
    // Performance Features
    enableHighRefresh: !platform.isMobile,
    enableAdvancedGraphics: !platform.isMobile,
    
    // Audio Features
    enableSpatialAudio: !platform.isMobile,
    enableAdvancedAudio: !platform.isMobile,
    
    // Screen size specific features
    cardSize: platform.screenSize,
    portraitSize: platform.screenSize === 'mobile' ? 'mobile' : 'desktop'
  };
};
