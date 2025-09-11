// Character Personality System
export interface CharacterPersonality {
  archetype: 'rookie' | 'veteran' | 'wildcard' | 'loyalist';
  traits: string[];
  relationships: Record<string, 'rival' | 'friend' | 'mentor' | 'romance' | 'neutral'>;
  memory: string[]; // Remembers past interactions
  growth: number;   // How much they've grown (0-10)
}

// Personality archetypes with their characteristics
export const personalityArchetypes = {
  rookie: {
    description: 'New to guild leadership, eager to learn but makes mistakes',
    traits: ['eager', 'inexperienced', 'optimistic', 'learning'],
    growthRate: 0.3 // Grows faster with good leadership
  },
  veteran: {
    description: 'Experienced but can become jaded or burned out',
    traits: ['experienced', 'practical', 'cynical', 'reliable'],
    growthRate: 0.1 // Grows slower but starts higher
  },
  wildcard: {
    description: 'Unpredictable, can be your greatest asset or biggest problem',
    traits: ['unpredictable', 'creative', 'risky', 'passionate'],
    growthRate: 0.2 // Growth depends on luck and choices
  },
  loyalist: {
    description: 'Always supports you, but may enable bad decisions',
    traits: ['loyal', 'supportive', 'enabling', 'devoted'],
    growthRate: 0.15 // Steady growth with consistent support
  }
};

// Generate personality for a character based on their name and role
export function generatePersonality(speaker: string): CharacterPersonality {
  // Simple hash-based personality generation for consistency
  const hash = speaker.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const archetypes = Object.keys(personalityArchetypes) as Array<keyof typeof personalityArchetypes>;
  const archetype = archetypes[Math.abs(hash) % archetypes.length];
  
  const baseTraits = personalityArchetypes[archetype].traits;
  
  // Add some random traits based on the character
  const additionalTraits = [
    'ambitious', 'cautious', 'impulsive', 'thoughtful', 'stubborn', 'flexible',
    'charismatic', 'quiet', 'dramatic', 'practical', 'idealistic', 'realistic'
  ];
  
  const randomTraits = additionalTraits
    .filter(() => Math.random() < 0.3)
    .slice(0, 2);
  
  return {
    archetype,
    traits: [...baseTraits, ...randomTraits],
    relationships: {},
    memory: [],
    growth: archetype === 'veteran' ? 5 : 2
  };
}

// Get personality-based event modifications
export function getPersonalityModifiers(personality: CharacterPersonality, eventType: string): Record<string, number> {
  const modifiers: Record<string, number> = {};
  
  // Rookie gets more growth from positive events
  if (personality.archetype === 'rookie' && eventType.includes('positive')) {
    modifiers.growth = 0.5;
  }
  
  // Veteran is less affected by negative events
  if (personality.archetype === 'veteran' && eventType.includes('negative')) {
    modifiers.growth = -0.2;
  }
  
  // Wildcard has random effects
  if (personality.archetype === 'wildcard') {
    if (Math.random() < 0.3) {
      modifiers.growth = Math.random() < 0.5 ? 0.3 : -0.3;
    }
  }
  
  // Loyalist provides stability
  if (personality.archetype === 'loyalist') {
    modifiers.growth = 0.1;
  }
  
  return modifiers;
}

// Update character growth based on event outcome
export function updateCharacterGrowth(
  personality: CharacterPersonality, 
  eventOutcome: 'positive' | 'negative' | 'neutral'
): CharacterPersonality {
  const newPersonality = { ...personality };
  
  let growthChange = 0;
  
  switch (personality.archetype) {
    case 'rookie':
      growthChange = eventOutcome === 'positive' ? 0.3 : eventOutcome === 'negative' ? -0.1 : 0.1;
      break;
    case 'veteran':
      growthChange = eventOutcome === 'positive' ? 0.1 : eventOutcome === 'negative' ? -0.2 : 0;
      break;
    case 'wildcard':
      growthChange = (Math.random() - 0.5) * 0.4; // Random growth
      break;
    case 'loyalist':
      growthChange = eventOutcome === 'positive' ? 0.15 : eventOutcome === 'negative' ? -0.05 : 0.05;
      break;
  }
  
  newPersonality.growth = Math.max(0, Math.min(10, personality.growth + growthChange));
  
  // Add memory of this interaction
  const memoryEntry = `${eventOutcome} event at growth level ${Math.round(personality.growth)}`;
  newPersonality.memory.push(memoryEntry);
  
  // Keep only last 10 memories
  if (newPersonality.memory.length > 10) {
    newPersonality.memory = newPersonality.memory.slice(-10);
  }
  
  return newPersonality;
}

// Get character description based on personality
export function getCharacterDescription(personality: CharacterPersonality): string {
  const archetype = personalityArchetypes[personality.archetype];
  const growthLevel = personality.growth;
  
  let description = archetype.description;
  
  if (growthLevel >= 8) {
    description += ' (Highly developed)';
  } else if (growthLevel >= 5) {
    description += ' (Well developed)';
  } else if (growthLevel >= 3) {
    description += ' (Developing)';
  } else {
    description += ' (Needs development)';
  }
  
  return description;
}
