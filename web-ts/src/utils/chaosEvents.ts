// Chaos Events System - Random events that can change everything
export interface ChaosEvent {
  id: string;
  title: string;
  body: string;
  speaker: string;
  portrait?: string;
  trigger: 'high_stakes' | 'low_stakes' | 'legacy_milestone' | 'random';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  effects: Record<string, number>;
  left: { label: string; effects: Record<string, number> };
  right: { label: string; effects: Record<string, number> };
  references?: string[]; // References to past runs
}

// Chaos events that can appear randomly
export const chaosEvents: ChaosEvent[] = [
  {
    id: 'chaos_time_echo',
    title: 'Echo from the Past',
    body: 'A message arrives from a previous guildmaster. "I remember when we faced this same crisis..."',
    speaker: 'Echo of the Past',
    trigger: 'random',
    rarity: 'uncommon',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Listen to wisdom', 
      effects: { funds: 1, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Ignore the past', 
      effects: { funds: -1, reputation: -1, readiness: -1 } 
    },
    references: ['past_run', 'wisdom']
  },
  {
    id: 'chaos_prophecy',
    title: 'The Prophecy',
    body: 'An ancient scroll speaks of a guild that will either save or destroy the realm. Could it be yours?',
    speaker: 'Mystic Seer',
    trigger: 'legacy_milestone',
    rarity: 'rare',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Embrace destiny', 
      effects: { funds: 2, reputation: 2, readiness: 2 } 
    },
    right: { 
      label: 'Reject fate', 
      effects: { funds: -2, reputation: -2, readiness: -2 } 
    },
    references: ['destiny', 'prophecy']
  },
  {
    id: 'chaos_wildcard',
    title: 'The Wildcard',
    body: 'A mysterious figure offers to join your guild. They claim to have powers beyond comprehension.',
    speaker: 'Mysterious Stranger',
    trigger: 'random',
    rarity: 'legendary',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Accept the wildcard', 
      effects: { funds: -3, reputation: 3, readiness: -3 } 
    },
    right: { 
      label: 'Send them away', 
      effects: { funds: 1, reputation: -1, readiness: 1 } 
    },
    references: ['wildcard', 'mystery']
  },
  {
    id: 'chaos_reality_glitch',
    title: 'Reality Glitch',
    body: 'The world around you flickers. For a moment, you see multiple versions of yourself making different choices.',
    speaker: 'Reality',
    trigger: 'high_stakes',
    rarity: 'legendary',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Embrace the glitch', 
      effects: { funds: 0, reputation: 0, readiness: 0 } 
    },
    right: { 
      label: 'Fight the glitch', 
      effects: { funds: 0, reputation: 0, readiness: 0 } 
    },
    references: ['reality', 'multiverse']
  },
  {
    id: 'chaos_legacy_whisper',
    title: 'Legacy Whisper',
    body: 'The spirits of past guildmasters whisper advice. "We failed where you might succeed..."',
    speaker: 'Spirits of the Past',
    trigger: 'legacy_milestone',
    rarity: 'uncommon',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Listen to spirits', 
      effects: { funds: 1, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Ignore the dead', 
      effects: { funds: -1, reputation: -1, readiness: -1 } 
    },
    references: ['past_guildmasters', 'spirits']
  },
  {
    id: 'chaos_mirror_universe',
    title: 'Mirror Universe',
    body: 'You catch a glimpse of an alternate reality where you made different choices. What if...?',
    speaker: 'Mirror Self',
    trigger: 'random',
    rarity: 'rare',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Learn from mirror', 
      effects: { funds: 2, reputation: -1, readiness: 2 } 
    },
    right: { 
      label: 'Reject mirror', 
      effects: { funds: -1, reputation: 2, readiness: -1 } 
    },
    references: ['alternate_reality', 'mirror']
  },
  {
    id: 'chaos_guild_ghost',
    title: 'Guild Ghost',
    body: 'The ghost of a legendary guildmaster appears. "I have been watching your progress..."',
    speaker: 'Guild Ghost',
    trigger: 'low_stakes',
    rarity: 'common',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Seek guidance', 
      effects: { funds: 0, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Dismiss ghost', 
      effects: { funds: 0, reputation: -1, readiness: -1 } 
    },
    references: ['ghost', 'guidance']
  },
  {
    id: 'chaos_time_loop',
    title: 'Time Loop',
    body: 'You feel like you\'ve lived this moment before. The same choices, the same outcomes...',
    speaker: 'Time Itself',
    trigger: 'random',
    rarity: 'rare',
    effects: { funds: 0, reputation: 0, readiness: 0 },
    left: { 
      label: 'Break the loop', 
      effects: { funds: 1, reputation: 1, readiness: 1 } 
    },
    right: { 
      label: 'Accept the loop', 
      effects: { funds: -1, reputation: -1, readiness: -1 } 
    },
    references: ['time_loop', 'deja_vu']
  }
];

// Calculate chaos chance based on game state
export function calculateChaosChance(
  meters: { funds: number; reputation: number; readiness: number },
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number },
  day: number
): number {
  let baseChance = 0.05; // 5% base chance
  
  // High stakes increase chaos chance
  const totalMeters = meters.funds + meters.reputation + meters.readiness;
  if (totalMeters >= 24) { // All meters high
    baseChance += 0.1;
  }
  
  // Low stakes increase chaos chance
  if (totalMeters <= 6) { // All meters low
    baseChance += 0.1;
  }
  
  // Legacy milestones increase chaos chance
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  if (totalLegacy > 0) {
    baseChance += Math.min(0.2, totalLegacy * 0.02);
  }
  
  // Later days increase chaos chance
  if (day > 10) {
    baseChance += 0.05;
  }
  
  return Math.min(0.3, baseChance); // Cap at 30%
}

// Get chaos events that can trigger based on current state
export function getAvailableChaosEvents(
  meters: { funds: number; reputation: number; readiness: number },
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number },
  _day: number
): ChaosEvent[] {
  const totalMeters = meters.funds + meters.reputation + meters.readiness;
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  
  return chaosEvents.filter(event => {
    switch (event.trigger) {
      case 'high_stakes':
        return totalMeters >= 24;
      case 'low_stakes':
        return totalMeters <= 6;
      case 'legacy_milestone':
        return totalLegacy > 0 && totalLegacy % 5 === 0;
      case 'random':
        return true;
      default:
        return false;
    }
  });
}

// Draw a random chaos event
export function drawChaosEvent(availableEvents: ChaosEvent[]): ChaosEvent | null {
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
