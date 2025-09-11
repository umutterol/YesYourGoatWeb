// Glitch Events System - Subtle MMO-like glitches that hint at the simulation
export interface GlitchEvent {
  id: string;
  title: string;
  body: string;
  speaker: string;
  portrait?: string;
  glitchType: 'repetition' | 'text_corruption' | 'character_confusion' | 'system_error' | 'real_world_data';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  effects: Record<string, number>;
  left: { label: string; effects: Record<string, number> };
  right: { label: string; effects: Record<string, number> };
  realWorldData?: {
    os?: string;
    browser?: string;
    timezone?: string;
    hardware?: string;
    location?: string;
    gameHistory?: string;
  };
}

// Real-world data detection
export function detectRealWorldData(): Partial<GlitchEvent['realWorldData']> {
  const data: Partial<GlitchEvent['realWorldData']> = {};
  
  // OS Detection
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows NT 10.0')) data.os = 'Windows 11';
    else if (userAgent.includes('Windows NT 6.3')) data.os = 'Windows 8.1';
    else if (userAgent.includes('Windows NT 6.1')) data.os = 'Windows 7';
    else if (userAgent.includes('Mac OS X')) data.os = 'macOS';
    else if (userAgent.includes('Linux')) data.os = 'Linux';
    
    // Browser Detection
    if (userAgent.includes('Chrome')) data.browser = 'Chrome';
    else if (userAgent.includes('Firefox')) data.browser = 'Firefox';
    else if (userAgent.includes('Safari')) data.browser = 'Safari';
    else if (userAgent.includes('Edge')) data.browser = 'Edge';
  }
  
  // Timezone
  try {
    data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    data.timezone = 'Unknown';
  }
  
  // Hardware (basic detection)
  if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency;
    if (cores >= 16) data.hardware = 'High-end CPU';
    else if (cores >= 8) data.hardware = 'Mid-range CPU';
    else data.hardware = 'Basic CPU';
  }
  
  // Game History (simulated - in real implementation, this would come from Steam API)
  const playTime = Math.floor(Math.random() * 100) + 1;
  if (playTime > 50) data.gameHistory = 'Heavy gamer';
  else if (playTime > 20) data.gameHistory = 'Regular gamer';
  else data.gameHistory = 'Casual gamer';
  
  return data;
}

// Generate glitch events based on real-world data
export function generateGlitchEvents(realWorldData: Partial<GlitchEvent['realWorldData']> = {}): GlitchEvent[] {
  const events: GlitchEvent[] = [];
  
  // Same Event Twice
  events.push({
    id: 'glitch_repetition',
    title: 'Deja Vu',
    body: 'Haven\'t we dealt with this before? This situation feels familiar...',
    speaker: 'Guild Member',
    glitchType: 'repetition',
    rarity: 'common',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'This feels familiar...', 
      effects: { funds: 0, reputation: 0, readiness: 0 } 
    },
    right: { 
      label: 'Just a coincidence', 
      effects: { funds: 0, reputation: 0, readiness: 0 } 
    }
  });
  
  // Event Text Slightly Off
  events.push({
    id: 'glitch_text_corruption',
    title: 'System Message',
    body: 'The guild\'s reputation is... stable? Something seems off with this report.',
    speaker: 'System Administrator',
    glitchType: 'text_corruption',
    rarity: 'common',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Something\'s not right...', 
      effects: { funds: 0, reputation: 0, readiness: 0 } 
    },
    right: { 
      label: 'Must be a typo', 
      effects: { funds: 0, reputation: 0, readiness: 0 } 
    }
  });
  
  // Character Appears Twice
  events.push({
    id: 'glitch_character_duplicate',
    title: 'Scheduling Conflict',
    body: 'I\'m back from my other duties. Wait, didn\'t I just see you?',
    speaker: 'Guild Member',
    glitchType: 'character_confusion',
    rarity: 'uncommon',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Ask for clarification', 
      effects: { funds: 1, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Ignore the confusion', 
      effects: { funds: -1, reputation: -1, readiness: -1 } 
    }
  });
  
  // Event Text Slightly Corrupted
  events.push({
    id: 'glitch_text_glitch',
    title: 'Data Corruption',
    body: 'The guild\'s reputation is... good? The system seems to be having issues.',
    speaker: 'System Administrator',
    glitchType: 'text_corruption',
    rarity: 'common',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Run diagnostics', 
      effects: { funds: 1, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Continue anyway', 
      effects: { funds: -1, reputation: -1, readiness: -1 } 
    }
  });
  
  // Character Speaks Formally
  events.push({
    id: 'glitch_system_message',
    title: 'System Message',
    body: 'System message: Event processing... Please stand by for further instructions.',
    speaker: 'System Administrator',
    glitchType: 'system_error',
    rarity: 'uncommon',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Wait for processing', 
      effects: { funds: 1, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Force continue', 
      effects: { funds: -1, reputation: -1, readiness: -1 } 
    }
  });
  
  // Event Text Has Typos
  events.push({
    id: 'glitch_typo',
    title: 'Typo in Report',
    body: 'The guild\'s reputaion is stable. Sorry, there seems to be a typo in the system.',
    speaker: 'Guild Member',
    glitchType: 'text_corruption',
    rarity: 'common',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Correct the typo', 
      effects: { funds: 1, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Ignore the typo', 
      effects: { funds: -1, reputation: -1, readiness: -1 } 
    }
  });
  
  // Character Role Changes
  events.push({
    id: 'glitch_role_change',
    title: 'Role Confusion',
    body: 'I\'m the new tank now, not the mage. The system seems to have mixed up our roles.',
    speaker: 'Guild Member',
    glitchType: 'character_confusion',
    rarity: 'uncommon',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Accept the change', 
      effects: { funds: 1, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Correct the role', 
      effects: { funds: -1, reputation: -1, readiness: -1 } 
    }
  });
  
  // Event References Development
  events.push({
    id: 'glitch_dev_reference',
    title: 'Development Update',
    body: 'The devs are working on this issue. It should be fixed in the next patch.',
    speaker: 'Guild Member',
    glitchType: 'system_error',
    rarity: 'rare',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Wait for patch', 
      effects: { funds: 1, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Work around it', 
      effects: { funds: -1, reputation: -1, readiness: -1 } 
    }
  });
  
  // Character Mentions Meta
  events.push({
    id: 'glitch_meta_comment',
    title: 'Player Complaint',
    body: 'This game is getting repetitive. Don\'t you think we\'ve done this before?',
    speaker: 'Guild Member',
    glitchType: 'repetition',
    rarity: 'uncommon',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Agree with them', 
      effects: { funds: 1, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Dismiss the complaint', 
      effects: { funds: -1, reputation: -1, readiness: -1 } 
    }
  });
  
  // Real-World Data Integration
  if (realWorldData?.os) {
    events.push({
      id: 'glitch_os_detection',
      title: 'System Check',
      body: `Your ${realWorldData.os} system is running smoothly. The guild's operations should be stable.`,
      speaker: 'System Administrator',
      glitchType: 'real_world_data',
      rarity: 'rare',
      effects: { funds: 0, reputation: 0, readiness: 0 },
      left: { 
        label: 'Trust the system', 
        effects: { funds: 1, reputation: 1, readiness: 1 } 
      },
      right: { 
        label: 'Question the check', 
        effects: { funds: -1, reputation: -1, readiness: -1 } 
      },
      realWorldData: { os: realWorldData.os }
    });
  }
  
  if (realWorldData?.browser) {
    events.push({
      id: 'glitch_browser_detection',
      title: 'Compatibility Check',
      body: `Your ${realWorldData.browser} browser is up to date. The guild's web interface should work perfectly.`,
      speaker: 'System Administrator',
      glitchType: 'real_world_data',
      rarity: 'rare',
      effects: { funds: 0, reputation: 0, readiness: 0 },
      left: { 
        label: 'Accept the check', 
        effects: { funds: 1, reputation: 1, readiness: 1 } 
      },
      right: { 
        label: 'Ignore the check', 
        effects: { funds: -1, reputation: -1, readiness: -1 } 
      },
      realWorldData: { browser: realWorldData.browser }
    });
  }
  
  if (realWorldData?.timezone) {
    events.push({
      id: 'glitch_timezone_detection',
      title: 'Scheduling Update',
      body: `It's ${new Date().toLocaleTimeString()} in your timezone (${realWorldData.timezone}). Perfect timing for guild activities.`,
      speaker: 'Guild Member',
      glitchType: 'real_world_data',
      rarity: 'uncommon',
      effects: { funds: 0, reputation: 0, readiness: 0 },
      left: { 
        label: 'Follow the schedule', 
        effects: { funds: 1, reputation: 1, readiness: 1 } 
      },
      right: { 
        label: 'Ignore the timing', 
        effects: { funds: -1, reputation: -1, readiness: -1 } 
      },
      realWorldData: { timezone: realWorldData.timezone }
    });
  }
  
  if (realWorldData?.hardware) {
    events.push({
      id: 'glitch_hardware_detection',
      title: 'Performance Check',
      body: `Your ${realWorldData.hardware} should handle this raid fine. The guild's operations will be smooth.`,
      speaker: 'System Administrator',
      glitchType: 'real_world_data',
      rarity: 'rare',
      effects: { funds: 0, reputation: 0, readiness: 0 },
      left: { 
        label: 'Trust the hardware', 
        effects: { funds: 1, reputation: 1, readiness: 1 } 
      },
      right: { 
        label: 'Question the check', 
        effects: { funds: -1, reputation: -1, readiness: -1 } 
      },
      realWorldData: { hardware: realWorldData.hardware }
    });
  }
  
  if (realWorldData?.gameHistory) {
    events.push({
      id: 'glitch_game_history',
      title: 'Player Profile',
      body: `I see you've been playing a lot of strategy games lately. Your experience should help with guild management.`,
      speaker: 'Guild Member',
      glitchType: 'real_world_data',
      rarity: 'uncommon',
      effects: { funds: 0, reputation: 0, readiness: 0 },
      left: { 
        label: 'Use your experience', 
        effects: { funds: 1, reputation: 1, readiness: 1 } 
      },
      right: { 
        label: 'Ignore the profile', 
        effects: { funds: -1, reputation: -1, readiness: -1 } 
      },
      realWorldData: { gameHistory: realWorldData.gameHistory }
    });
  }
  
  return events;
}

// Calculate glitch chance based on game state
export function calculateGlitchChance(
  meters: { funds: number; reputation: number; readiness: number },
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number },
  day: number
): number {
  let baseChance = 0.01; // 1% base chance (much rarer)
  
  // Legacy points increase glitch chance
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  if (totalLegacy > 0) {
    baseChance += Math.min(0.05, totalLegacy * 0.005); // Much smaller increase
  }
  
  // Later days increase glitch chance slightly
  if (day > 15) {
    baseChance += 0.01;
  }
  
  // High or low meter extremes increase glitch chance slightly
  const totalMeters = meters.funds + meters.reputation + meters.readiness;
  if (totalMeters >= 24 || totalMeters <= 6) {
    baseChance += 0.02;
  }
  
  return Math.min(0.08, baseChance); // Cap at 8% (much lower)
}

// Get available glitch events
export function getAvailableGlitchEvents(
  _meters: { funds: number; reputation: number; readiness: number },
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number },
  _day: number
): GlitchEvent[] {
  const realWorldData = detectRealWorldData();
  const allEvents = generateGlitchEvents(realWorldData);
  
  // Filter based on legacy points for story progression
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  
  return allEvents.filter(event => {
    // Phase 1 (0-5 legacy points): Only basic glitches
    if (totalLegacy < 5) {
      return event.glitchType === 'repetition' || event.glitchType === 'text_corruption';
    }
    
    // Phase 2 (5-10 legacy points): Add character confusion
    if (totalLegacy < 10) {
      return event.glitchType !== 'real_world_data';
    }
    
    // Phase 3 (10-20 legacy points): Add system errors
    if (totalLegacy < 20) {
      return event.glitchType !== 'real_world_data' || event.rarity === 'rare';
    }
    
    // Phase 4 (20+ legacy points): All glitches available
    return true;
  });
}

// Draw a random glitch event
export function drawGlitchEvent(availableEvents: GlitchEvent[]): GlitchEvent | null {
  if (availableEvents.length === 0) return null;
  
  // Weight by rarity
  const weights = availableEvents.map(event => {
    switch (event.rarity) {
      case 'common': return 10;
      case 'uncommon': return 5;
      case 'rare': return 2;
      case 'legendary': return 1;
      default: return 1;
    }
  });
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < availableEvents.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return availableEvents[i];
    }
  }
  
  return availableEvents[0]; // Fallback
}
