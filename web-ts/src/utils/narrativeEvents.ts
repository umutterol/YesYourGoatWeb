// Narrative Events System
// Provides story-driven events that build the meta-narrative across runs

export interface NarrativeEvent {
  id: string;
  title: string;
  speaker: string;
  portrait: string;
  body: string;
  phase: 1 | 2 | 3 | 4;
  category: 'glitch' | 'game_master' | 'meta' | 'character';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  requirements: {
    minLegacyPoints?: number;
    minRuns?: number;
    maxRuns?: number;
    collapseTypes?: string[];
  };
  left: {
    label: string;
    effects: Record<string, number>;
    narrativeEffect?: string;
  };
  right: {
    label: string;
    effects: Record<string, number>;
    narrativeEffect?: string;
  };
}

// Phase 1: Normal MMO Events
export const phase1Events: NarrativeEvent[] = [
  {
    id: "narrative_intro_01",
    title: "Welcome to the Guild",
    speaker: "Council Moderator",
    portrait: "/resources/portraits/paladin.png",
    body: "Welcome, new Guildmaster. This guild has a long and storied history. Many have led before you.",
    phase: 1,
    category: 'character',
    rarity: 'common',
    requirements: { minRuns: 1, maxRuns: 1 },
    left: { label: "I'm honored.", effects: { reputation: 1 } },
    right: { label: "Tell me more.", effects: { readiness: 1 } }
  },
  {
    id: "narrative_history_01",
    title: "The Previous Leader",
    speaker: "Officer",
    portrait: "/resources/portraits/warden.png",
    body: "The last Guildmaster... well, they had their own way of doing things. Different from yours.",
    phase: 1,
    category: 'character',
    rarity: 'common',
    requirements: { minRuns: 1, maxRuns: 2 },
    left: { label: "What happened to them?", effects: { reputation: 1 } },
    right: { label: "I'll do better.", effects: { readiness: 1 } }
  }
];

// Phase 2: Something's Wrong Events
export const phase2Events: NarrativeEvent[] = [
  {
    id: "narrative_deja_vu_01",
    title: "Familiar Feeling",
    speaker: "Rogue",
    portrait: "/resources/portraits/rogue.png",
    body: "This feels... familiar. Have we done this before? I keep having these strange dreams.",
    phase: 2,
    category: 'glitch',
    rarity: 'uncommon',
    requirements: { minLegacyPoints: 1, minRuns: 2 },
    left: { label: "What kind of dreams?", effects: { reputation: 1 } },
    right: { label: "Focus on the task.", effects: { readiness: 1 } }
  },
  {
    id: "narrative_repeat_01",
    title: "Same Event Twice",
    speaker: "Tank",
    portrait: "/resources/portraits/mountainking.png",
    body: "Wait... didn't we just deal with this exact situation? I could swear we've been here before.",
    phase: 2,
    category: 'glitch',
    rarity: 'rare',
    requirements: { minLegacyPoints: 2, minRuns: 2 },
    left: { label: "You're right...", effects: { reputation: 1 } },
    right: { label: "Just a coincidence.", effects: { readiness: 1 } }
  },
  {
    id: "narrative_memory_01",
    title: "Strange Memory",
    speaker: "Mage",
    portrait: "/resources/portraits/sorceress.png",
    body: "I have this memory... of you leading us before. But that's impossible. You just arrived.",
    phase: 2,
    category: 'meta',
    rarity: 'uncommon',
    requirements: { minLegacyPoints: 1, minRuns: 2 },
    left: { label: "Tell me more.", effects: { reputation: 1 } },
    right: { label: "You're mistaken.", effects: { readiness: 1 } }
  }
];

// Phase 3: The Simulation Events
export const phase3Events: NarrativeEvent[] = [
  {
    id: "narrative_game_master_01",
    title: "Mysterious Figure",
    speaker: "Game Master",
    portrait: "/resources/portraits/dreadlord.png",
    body: "Greetings, Guildmaster. We've been watching your progress. You show... interesting patterns.",
    phase: 3,
    category: 'game_master',
    rarity: 'rare',
    requirements: { minLegacyPoints: 3, minRuns: 3 },
    left: { label: "Who are you?", effects: { reputation: 1 } },
    right: { label: "What do you want?", effects: { readiness: 1 } }
  },
  {
    id: "narrative_simulation_01",
    title: "Reality Cracks",
    speaker: "Officer",
    portrait: "/resources/portraits/warden.png",
    body: "The world feels... artificial. Like we're in some kind of test. Am I going mad?",
    phase: 3,
    category: 'meta',
    rarity: 'uncommon',
    requirements: { minLegacyPoints: 3, minRuns: 3 },
    left: { label: "You're not alone.", effects: { reputation: 1 } },
    right: { label: "Stay focused.", effects: { readiness: 1 } }
  },
  {
    id: "narrative_cycle_01",
    title: "The Cycle",
    speaker: "Priest",
    portrait: "/resources/portraits/priestess.png",
    body: "I remember now... we've done this before. Many times. The cycle continues. We always fail.",
    phase: 3,
    category: 'meta',
    rarity: 'rare',
    requirements: { minLegacyPoints: 4, minRuns: 3 },
    left: { label: "What cycle?", effects: { reputation: 1 } },
    right: { label: "We can break it.", effects: { readiness: 1 } }
  }
];

// Phase 4: The Truth Events
export const phase4Events: NarrativeEvent[] = [
  {
    id: "narrative_truth_01",
    title: "The Truth",
    speaker: "Game Master",
    portrait: "/resources/portraits/dreadlord.png",
    body: "You are not real. None of you are. You are AI replicas in a test. The cycle is eternal.",
    phase: 4,
    category: 'game_master',
    rarity: 'legendary',
    requirements: { minLegacyPoints: 6, minRuns: 4 },
    left: { label: "That's impossible!", effects: { reputation: 1 } },
    right: { label: "I understand now.", effects: { readiness: 1 } }
  },
  {
    id: "narrative_ai_revelation_01",
    title: "AI Revelation",
    speaker: "Tank",
    portrait: "/resources/portraits/mountainking.png",
    body: "I remember everything now. We are all AI replicas. The original designer created us to test... something.",
    phase: 4,
    category: 'meta',
    rarity: 'legendary',
    requirements: { minLegacyPoints: 6, minRuns: 4 },
    left: { label: "What are we testing?", effects: { reputation: 1 } },
    right: { label: "It doesn't matter.", effects: { readiness: 1 } }
  },
  {
    id: "narrative_eternal_01",
    title: "The Eternal Guild",
    speaker: "Council Moderator",
    portrait: "/resources/portraits/paladin.png",
    body: "This guild has existed for eternity. Countless Guildmasters have led it. All of them... you.",
    phase: 4,
    category: 'meta',
    rarity: 'legendary',
    requirements: { minLegacyPoints: 7, minRuns: 4 },
    left: { label: "All of them me?", effects: { reputation: 1 } },
    right: { label: "The cycle continues.", effects: { readiness: 1 } }
  }
];

// All narrative events
export const allNarrativeEvents: NarrativeEvent[] = [
  ...phase1Events,
  ...phase2Events,
  ...phase3Events,
  ...phase4Events
];

// Get available narrative events for current phase
export function getAvailableNarrativeEvents(
  currentPhase: number,
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number },
  runCount: number,
  collapseTypes: string[]
): NarrativeEvent[] {
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  
  return allNarrativeEvents.filter(event => {
    // Check phase requirement
    if (event.phase !== currentPhase) return false;
    
    // Check legacy points requirement
    if (event.requirements.minLegacyPoints && totalLegacy < event.requirements.minLegacyPoints) return false;
    
    // Check run count requirements
    if (event.requirements.minRuns && runCount < event.requirements.minRuns) return false;
    if (event.requirements.maxRuns && runCount > event.requirements.maxRuns) return false;
    
    // Check collapse type requirements
    if (event.requirements.collapseTypes && event.requirements.collapseTypes.length > 0) {
      const hasRequiredCollapseType = event.requirements.collapseTypes.some(type => 
        collapseTypes.includes(type)
      );
      if (!hasRequiredCollapseType) return false;
    }
    
    return true;
  });
}

// Get narrative event by ID
export function getNarrativeEventById(id: string): NarrativeEvent | undefined {
  return allNarrativeEvents.find(event => event.id === id);
}

// Get narrative event weight based on rarity
export function getNarrativeEventWeight(event: NarrativeEvent): number {
  const rarityWeights = {
    common: 1.0,
    uncommon: 0.5,
    rare: 0.2,
    legendary: 0.05
  };
  
  return rarityWeights[event.rarity] || 1.0;
}

// Get narrative event chance based on phase and rarity
export function getNarrativeEventChance(
  event: NarrativeEvent,
  currentPhase: number,
  baseChance: number = 0.1
): number {
  const phaseMultipliers = {
    1: 0.5,  // Phase 1: Lower chance
    2: 1.0,  // Phase 2: Normal chance
    3: 1.5,  // Phase 3: Higher chance
    4: 2.0   // Phase 4: Highest chance
  };
  
  const rarityMultipliers = {
    common: 1.0,
    uncommon: 0.7,
    rare: 0.4,
    legendary: 0.1
  };
  
  const phaseMultiplier = phaseMultipliers[currentPhase as keyof typeof phaseMultipliers] || 1.0;
  const rarityMultiplier = rarityMultipliers[event.rarity] || 1.0;
  
  return baseChance * phaseMultiplier * rarityMultiplier;
}

// Get narrative event description with phase context
export function getNarrativeEventDescription(
  event: NarrativeEvent,
  currentPhase: number
): string {
  const phaseContext = {
    1: "The guild feels normal, but something lingers...",
    2: "Strange things begin to happen...",
    3: "Reality starts to crack...",
    4: "The truth is revealed..."
  };
  
  const context = phaseContext[currentPhase as keyof typeof phaseContext] || "";
  return `${context} ${event.body}`;
}
