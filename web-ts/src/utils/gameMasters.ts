// Game Master System - Mysterious entities that offer power with hidden consequences
export interface GameMasterOffer {
  id: string;
  title: string;
  body: string;
  speaker: string;
  portrait?: string;
  offerType: 'power' | 'resources' | 'knowledge' | 'escape';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  visibleEffects: Record<string, number>; // What the player sees
  hiddenEffects: Record<string, number>; // What actually happens
  left: { 
    label: string; 
    visibleEffects: Record<string, number>;
    hiddenEffects: Record<string, number>;
  };
  right: { 
    label: string; 
    visibleEffects: Record<string, number>;
    hiddenEffects: Record<string, number>;
  };
  phase: 1 | 2 | 3 | 4; // Which story phase this appears in
}

// Game Master offers that appear based on story phase
export const gameMasterOffers: GameMasterOffer[] = [
  // Phase 1: Normal MMO (5+ Legacy Points)
  {
    id: 'gm_power_weapons',
    title: 'Legendary Weapons',
    body: 'We can provide your guild with legendary weapons that will make you unstoppable in raids.',
    speaker: 'Mysterious Benefactor',
    offerType: 'power',
    rarity: 'common',
    visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
    hiddenEffects: { funds: -2, reputation: 0, readiness: 0 },
    left: {
      label: 'Accept the weapons',
      visibleEffects: { funds: 0, reputation: 2, readiness: 2 },
      hiddenEffects: { funds: -3, reputation: 0, readiness: 0 }
    },
    right: {
      label: 'Decline politely',
      visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
      hiddenEffects: { funds: 1, reputation: 1, readiness: 1 }
    },
    phase: 1
  },
  
  // Phase 2: Glitches Appear (10+ Legacy Points)
  {
    id: 'gm_resources_boost',
    title: 'Resource Boost',
    body: 'We can boost your guild\'s resources significantly. Your reputation will soar.',
    speaker: 'Shadowy Figure',
    offerType: 'resources',
    rarity: 'uncommon',
    visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
    hiddenEffects: { funds: 0, reputation: -2, readiness: 0 },
    left: {
      label: 'Take the boost',
      visibleEffects: { funds: 3, reputation: 3, readiness: 0 },
      hiddenEffects: { funds: 0, reputation: -4, readiness: 0 }
    },
    right: {
      label: 'Refuse the offer',
      visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
      hiddenEffects: { funds: 1, reputation: 1, readiness: 1 }
    },
    phase: 2
  },
  
  // Phase 3: Simulation Revealed (20+ Legacy Points)
  {
    id: 'gm_knowledge_secrets',
    title: 'Hidden Knowledge',
    body: 'We can tell you secrets about the game that other players don\'t know. This will give you an edge.',
    speaker: 'Whispering Voice',
    offerType: 'knowledge',
    rarity: 'rare',
    visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
    hiddenEffects: { funds: 0, reputation: 0, readiness: -2 },
    left: {
      label: 'Learn the secrets',
      visibleEffects: { funds: 2, reputation: 2, readiness: 2 },
      hiddenEffects: { funds: 0, reputation: 0, readiness: -3 }
    },
    right: {
      label: 'Stay ignorant',
      visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
      hiddenEffects: { funds: 1, reputation: 1, readiness: 1 }
    },
    phase: 3
  },
  
  // Phase 4: The Truth (50+ Legacy Points)
  {
    id: 'gm_escape_cycle',
    title: 'Break the Cycle',
    body: 'We can help you escape this endless cycle of failure. You don\'t have to keep repeating the same mistakes.',
    speaker: 'The Voice of Reason',
    offerType: 'escape',
    rarity: 'legendary',
    visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
    hiddenEffects: { funds: -5, reputation: -5, readiness: -5 },
    left: {
      label: 'Accept escape',
      visibleEffects: { funds: 5, reputation: 5, readiness: 5 },
      hiddenEffects: { funds: -8, reputation: -8, readiness: -8 }
    },
    right: {
      label: 'Embrace the cycle',
      visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
      hiddenEffects: { funds: 2, reputation: 2, readiness: 2 }
    },
    phase: 4
  },
  
  // Additional Phase 1 offers
  {
    id: 'gm_power_gear',
    title: 'Epic Gear',
    body: 'We can provide your guild with epic gear that will make you the envy of other players.',
    speaker: 'Mysterious Benefactor',
    offerType: 'power',
    rarity: 'common',
    visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
    hiddenEffects: { funds: -1, reputation: 0, readiness: 0 },
    left: {
      label: 'Take the gear',
      visibleEffects: { funds: 0, reputation: 1, readiness: 2 },
      hiddenEffects: { funds: -2, reputation: 0, readiness: 0 }
    },
    right: {
      label: 'Decline the gear',
      visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
      hiddenEffects: { funds: 1, reputation: 1, readiness: 1 }
    },
    phase: 1
  },
  
  // Additional Phase 2 offers
  {
    id: 'gm_resources_gold',
    title: 'Gold Rush',
    body: 'We can arrange for a gold rush that will fill your guild\'s coffers to the brim.',
    speaker: 'Shadowy Figure',
    offerType: 'resources',
    rarity: 'uncommon',
    visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
    hiddenEffects: { funds: 0, reputation: -1, readiness: 0 },
    left: {
      label: 'Accept the gold',
      visibleEffects: { funds: 4, reputation: 0, readiness: 0 },
      hiddenEffects: { funds: 0, reputation: -2, readiness: 0 }
    },
    right: {
      label: 'Refuse the gold',
      visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
      hiddenEffects: { funds: 1, reputation: 1, readiness: 1 }
    },
    phase: 2
  },
  
  // Additional Phase 3 offers
  {
    id: 'gm_knowledge_glitches',
    title: 'Glitch Explanation',
    body: 'We can explain why you\'re seeing glitches and strange behavior. This knowledge will help you understand the game better.',
    speaker: 'Whispering Voice',
    offerType: 'knowledge',
    rarity: 'rare',
    visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
    hiddenEffects: { funds: 0, reputation: 0, readiness: -1 },
    left: {
      label: 'Learn about glitches',
      visibleEffects: { funds: 1, reputation: 1, readiness: 1 },
      hiddenEffects: { funds: 0, reputation: 0, readiness: -2 }
    },
    right: {
      label: 'Ignore the explanation',
      visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
      hiddenEffects: { funds: 1, reputation: 1, readiness: 1 }
    },
    phase: 3
  },
  
  // Additional Phase 4 offers
  {
    id: 'gm_escape_truth',
    title: 'The Truth',
    body: 'We can reveal the truth about your existence. You\'re not who you think you are. This knowledge will set you free.',
    speaker: 'The Voice of Reason',
    offerType: 'escape',
    rarity: 'legendary',
    visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
    hiddenEffects: { funds: -3, reputation: -3, readiness: -3 },
    left: {
      label: 'Learn the truth',
      visibleEffects: { funds: 3, reputation: 3, readiness: 3 },
      hiddenEffects: { funds: -5, reputation: -5, readiness: -5 }
    },
    right: {
      label: 'Reject the truth',
      visibleEffects: { funds: 0, reputation: 0, readiness: 0 },
      hiddenEffects: { funds: 2, reputation: 2, readiness: 2 }
    },
    phase: 4
  }
];

// Calculate Game Master appearance chance
export function calculateGameMasterChance(
  meters: { funds: number; reputation: number; readiness: number },
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number },
  day: number
): number {
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  
  // Game Masters only appear after Phase 1 (5+ legacy points)
  if (totalLegacy < 5) return 0;
  
  let baseChance = 0.02; // 2% base chance
  
  // Higher legacy points increase chance
  if (totalLegacy >= 50) baseChance = 0.1; // Phase 4
  else if (totalLegacy >= 20) baseChance = 0.08; // Phase 3
  else if (totalLegacy >= 10) baseChance = 0.05; // Phase 2
  else baseChance = 0.03; // Phase 1
  
  // Desperate situations increase chance
  const totalMeters = meters.funds + meters.reputation + meters.readiness;
  if (totalMeters <= 9) { // Very low meters
    baseChance += 0.05;
  }
  
  // Later days increase chance
  if (day > 15) {
    baseChance += 0.02;
  }
  
  return Math.min(0.15, baseChance); // Cap at 15%
}

// Get available Game Master offers based on current phase
export function getAvailableGameMasterOffers(
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number }
): GameMasterOffer[] {
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  
  // Determine current phase
  let currentPhase: 1 | 2 | 3 | 4;
  if (totalLegacy >= 50) currentPhase = 4;
  else if (totalLegacy >= 20) currentPhase = 3;
  else if (totalLegacy >= 10) currentPhase = 2;
  else currentPhase = 1;
  
  // Return offers for current phase and all previous phases
  return gameMasterOffers.filter(offer => offer.phase <= currentPhase);
}

// Draw a random Game Master offer
export function drawGameMasterOffer(availableOffers: GameMasterOffer[]): GameMasterOffer | null {
  if (availableOffers.length === 0) return null;
  
  // Weight by rarity
  const weights = availableOffers.map(offer => {
    switch (offer.rarity) {
      case 'common': return 10;
      case 'uncommon': return 5;
      case 'rare': return 2;
      case 'legendary': return 1;
      default: return 1;
    }
  });
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < availableOffers.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return availableOffers[i];
    }
  }
  
  return availableOffers[0]; // Fallback
}

// Apply Game Master offer effects (both visible and hidden)
export function applyGameMasterEffects(
  meters: { funds: number; reputation: number; readiness: number },
  choice: 'left' | 'right',
  offer: GameMasterOffer
): { funds: number; reputation: number; readiness: number } {
  const selectedChoice = choice === 'left' ? offer.left : offer.right;
  
  // Apply visible effects first
  let newMeters = { ...meters };
  Object.entries(selectedChoice.visibleEffects).forEach(([key, value]) => {
    if (key in newMeters) {
      newMeters[key as keyof typeof newMeters] = Math.max(0, Math.min(10, newMeters[key as keyof typeof newMeters] + value));
    }
  });
  
  // Then apply hidden effects
  Object.entries(selectedChoice.hiddenEffects).forEach(([key, value]) => {
    if (key in newMeters) {
      newMeters[key as keyof typeof newMeters] = Math.max(0, Math.min(10, newMeters[key as keyof typeof newMeters] + value));
    }
  });
  
  return newMeters;
}
