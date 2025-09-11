// Meta-Narrative Progression System
// This system manages the overarching story that spans multiple runs
// and reveals the true nature of the simulation

export interface MetaNarrativePhase {
  phase: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  trigger: {
    minLegacyPoints: number;
    minRuns: number;
  };
  visualStyle: {
    uiGlitches: boolean;
    corruptedText: boolean;
    artificialUI: boolean;
    cosmicEffects: boolean;
  };
  eventModifiers: {
    glitchChance: number;
    gameMasterChance: number;
    chaosChance: number;
    metaEvents: number;
  };
  storyElements: {
    glitchEvents: string[];
    gameMasterOffers: string[];
    metaEvents: string[];
    characterDialogue: string[];
  };
  revelationLevel: 'none' | 'subtle' | 'obvious' | 'explicit';
}

// Define the four phases of meta-narrative revelation
export const metaNarrativePhases: MetaNarrativePhase[] = [
  {
    phase: 1,
    name: "The Normal MMO",
    description: "Everything seems like a regular MMO. You're just managing a guild.",
    trigger: {
      minLegacyPoints: 0,
      minRuns: 1
    },
    visualStyle: {
      uiGlitches: false,
      corruptedText: false,
      artificialUI: false,
      cosmicEffects: false
    },
    eventModifiers: {
      glitchChance: 0.0,
      gameMasterChance: 0.0,
      chaosChance: 0.5,
      metaEvents: 0.0
    },
    storyElements: {
      glitchEvents: [],
      gameMasterOffers: [],
      metaEvents: [],
      characterDialogue: [
        "Welcome to the guild, new leader.",
        "We've been waiting for someone like you.",
        "The previous guildmaster... well, let's not talk about that.",
        "This guild has a long history."
      ]
    },
    revelationLevel: 'none'
  },
  {
    phase: 2,
    name: "Something's Wrong",
    description: "Strange things start happening. Events repeat. Characters say odd things.",
    trigger: {
      minLegacyPoints: 5,
      minRuns: 3
    },
    visualStyle: {
      uiGlitches: true,
      corruptedText: false,
      artificialUI: false,
      cosmicEffects: false
    },
    eventModifiers: {
      glitchChance: 0.02,
      gameMasterChance: 0.0,
      chaosChance: 0.8,
      metaEvents: 0.1
    },
    storyElements: {
      glitchEvents: [
        "same_event_twice",
        "corrupted_text",
        "character_deja_vu"
      ],
      gameMasterOffers: [],
      metaEvents: [
        "strange_memory",
        "recurring_dream"
      ],
      characterDialogue: [
        "Have we done this before?",
        "Something feels familiar...",
        "I keep having these dreams...",
        "The previous guildmaster said the same thing."
      ]
    },
    revelationLevel: 'subtle'
  },
  {
    phase: 3,
    name: "The Simulation",
    description: "Mysterious Game Masters appear. Reality begins to crack.",
    trigger: {
      minLegacyPoints: 15,
      minRuns: 6
    },
    visualStyle: {
      uiGlitches: true,
      corruptedText: true,
      artificialUI: true,
      cosmicEffects: false
    },
    eventModifiers: {
      glitchChance: 0.05,
      gameMasterChance: 0.02,
      chaosChance: 1.2,
      metaEvents: 0.3
    },
    storyElements: {
      glitchEvents: [
        "same_event_twice",
        "corrupted_text",
        "character_deja_vu",
        "future_reference",
        "real_world_data"
      ],
      gameMasterOffers: [
        "power_offer",
        "knowledge_offer",
        "escape_offer"
      ],
      metaEvents: [
        "strange_memory",
        "recurring_dream",
        "simulation_hint",
        "ai_revelation"
      ],
      characterDialogue: [
        "The Game Masters are watching...",
        "This isn't real, is it?",
        "I remember... I remember everything.",
        "We've been here before. Many times.",
        "The cycle continues..."
      ]
    },
    revelationLevel: 'obvious'
  },
  {
    phase: 4,
    name: "The Truth",
    description: "The full truth is revealed. You are an AI replica in a test.",
    trigger: {
      minLegacyPoints: 30,
      minRuns: 10
    },
    visualStyle: {
      uiGlitches: true,
      corruptedText: true,
      artificialUI: true,
      cosmicEffects: true
    },
    eventModifiers: {
      glitchChance: 0.08,
      gameMasterChance: 0.05,
      chaosChance: 1.5,
      metaEvents: 0.5
    },
    storyElements: {
      glitchEvents: [
        "same_event_twice",
        "corrupted_text",
        "character_deja_vu",
        "future_reference",
        "real_world_data",
        "simulation_break"
      ],
      gameMasterOffers: [
        "power_offer",
        "knowledge_offer",
        "escape_offer",
        "truth_offer",
        "cycle_break_offer"
      ],
      metaEvents: [
        "strange_memory",
        "recurring_dream",
        "simulation_hint",
        "ai_revelation",
        "cycle_revelation",
        "purpose_revelation"
      ],
      characterDialogue: [
        "You are not the first. You will not be the last.",
        "The simulation continues. The cycle repeats.",
        "We are all AI replicas. None of us are real.",
        "The Game Masters control everything.",
        "There is no escape. Only the cycle.",
        "Welcome to the eternal test."
      ]
    },
    revelationLevel: 'explicit'
  }
];

// Get current meta-narrative phase based on legacy points and run count
export function getCurrentMetaNarrativePhase(
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number },
  runCount: number
): MetaNarrativePhase {
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  
  // Find the highest phase that meets the requirements
  for (let i = metaNarrativePhases.length - 1; i >= 0; i--) {
    const phase = metaNarrativePhases[i];
    if (totalLegacy >= phase.trigger.minLegacyPoints && runCount >= phase.trigger.minRuns) {
      return phase;
    }
  }
  
  return metaNarrativePhases[0]; // Default to phase 1
}

// Get phase progression (0-1)
export function getMetaNarrativeProgress(
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; legend: number; survivor: number },
  runCount: number
): number {
  const currentPhase = getCurrentMetaNarrativePhase(legacyPoints, runCount);
  const phaseIndex = currentPhase.phase - 1;
  
  if (phaseIndex === 0) {
    // Phase 1: Progress based on run count
    return Math.min(1, runCount / 3);
  }
  
  // Other phases: Progress based on legacy points
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  const currentThreshold = currentPhase.trigger.minLegacyPoints;
  const nextThreshold = phaseIndex < metaNarrativePhases.length - 1 
    ? metaNarrativePhases[phaseIndex + 1].trigger.minLegacyPoints 
    : currentThreshold + 20;
  
  return Math.min(1, (totalLegacy - currentThreshold) / (nextThreshold - currentThreshold));
}

// Get phase transition message
export function getMetaNarrativeTransitionMessage(
  oldPhase: MetaNarrativePhase | null,
  newPhase: MetaNarrativePhase
): string {
  if (!oldPhase || oldPhase.phase === newPhase.phase) {
    return '';
  }
  
  const transitions = {
    1: "The guild feels... different. Something has changed.",
    2: "Strange things begin to happen. Reality starts to crack.",
    3: "Mysterious figures appear. The truth begins to surface.",
    4: "The full truth is revealed. The cycle continues..."
  };
  
  return transitions[newPhase.phase as keyof typeof transitions] || '';
}

// Get story element based on current phase
export function getStoryElement(
  elementType: 'glitchEvents' | 'gameMasterOffers' | 'metaEvents' | 'characterDialogue',
  currentPhase: MetaNarrativePhase
): string[] {
  return currentPhase.storyElements[elementType] || [];
}

// Check if a specific story element should appear
export function shouldShowStoryElement(
  elementType: 'glitchEvents' | 'gameMasterOffers' | 'metaEvents' | 'characterDialogue',
  elementId: string,
  currentPhase: MetaNarrativePhase
): boolean {
  const elements = getStoryElement(elementType, currentPhase);
  return elements.includes(elementId);
}

// Get phase-specific event modifiers
export function getPhaseEventModifiers(currentPhase: MetaNarrativePhase) {
  return currentPhase.eventModifiers;
}

// Get phase-specific visual effects
export function getPhaseVisualEffects(currentPhase: MetaNarrativePhase) {
  return currentPhase.visualStyle;
}

// Get phase description with current progress
export function getPhaseDescriptionWithProgress(
  currentPhase: MetaNarrativePhase,
  progress: number
): string {
  const progressPercent = Math.round(progress * 100);
  return `${currentPhase.description} (${progressPercent}% through ${currentPhase.name})`;
}

// Get revelation level description
export function getRevelationLevelDescription(level: string): string {
  switch (level) {
    case 'none':
      return 'No awareness of the simulation';
    case 'subtle':
      return 'Something feels wrong, but unclear what';
    case 'obvious':
      return 'Clear signs of simulation, but not fully understood';
    case 'explicit':
      return 'Full understanding of the AI replica nature';
    default:
      return 'Unknown revelation level';
  }
}

// Get phase-specific CSS classes for visual effects
export function getPhaseCSSClasses(currentPhase: MetaNarrativePhase): string[] {
  const classes: string[] = [];
  
  if (currentPhase.visualStyle.uiGlitches) {
    classes.push('ui-glitches');
  }
  if (currentPhase.visualStyle.corruptedText) {
    classes.push('corrupted-text');
  }
  if (currentPhase.visualStyle.artificialUI) {
    classes.push('artificial-ui');
  }
  if (currentPhase.visualStyle.cosmicEffects) {
    classes.push('cosmic-effects');
  }
  
  return classes;
}
