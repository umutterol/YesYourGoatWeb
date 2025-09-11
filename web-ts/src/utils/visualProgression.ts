// Visual Progression System - Guild hall and character evolution
export interface VisualProgression {
  guildHallLevel: number;
  characterPortraits: Record<string, string>; // Different portraits for different growth levels
  eventCardStyle: 'basic' | 'enhanced' | 'legendary' | 'transcendent';
  colorTheme: string;
  effects: string[]; // Visual effects like particles, glows, etc.
}

// Guild hall levels with descriptions
export const guildHallLevels = [
  {
    level: 0,
    name: 'Tent Camp',
    description: 'A simple tent in the wilderness',
    color: 'from-gray-400 to-gray-600',
    effects: ['basic']
  },
  {
    level: 1,
    name: 'Wooden Hall',
    description: 'A sturdy wooden building',
    color: 'from-amber-400 to-orange-400',
    effects: ['basic', 'warm_glow']
  },
  {
    level: 2,
    name: 'Stone Fortress',
    description: 'A formidable stone structure',
    color: 'from-stone-400 to-gray-500',
    effects: ['basic', 'warm_glow', 'stone_texture']
  },
  {
    level: 3,
    name: 'Marble Palace',
    description: 'An elegant marble palace',
    color: 'from-white to-gray-200',
    effects: ['basic', 'warm_glow', 'stone_texture', 'marble_shine']
  },
  {
    level: 4,
    name: 'Crystal Citadel',
    description: 'A magnificent crystal citadel',
    color: 'from-blue-300 to-purple-400',
    effects: ['basic', 'warm_glow', 'stone_texture', 'marble_shine', 'crystal_glow']
  },
  {
    level: 5,
    name: 'Floating Sanctum',
    description: 'A floating sanctum in the clouds',
    color: 'from-pink-300 to-yellow-300',
    effects: ['basic', 'warm_glow', 'stone_texture', 'marble_shine', 'crystal_glow', 'floating_particles']
  }
];

// Character portrait evolution levels
export const portraitEvolutionLevels = [
  {
    level: 0,
    name: 'Novice',
    description: 'Basic portrait with simple styling',
    effects: ['basic_portrait']
  },
  {
    level: 1,
    name: 'Apprentice',
    description: 'Slightly enhanced with subtle effects',
    effects: ['basic_portrait', 'subtle_glow']
  },
  {
    level: 2,
    name: 'Adept',
    description: 'Enhanced with better lighting and effects',
    effects: ['basic_portrait', 'subtle_glow', 'enhanced_lighting']
  },
  {
    level: 3,
    name: 'Expert',
    description: 'Professional quality with dynamic effects',
    effects: ['basic_portrait', 'subtle_glow', 'enhanced_lighting', 'dynamic_effects']
  },
  {
    level: 4,
    name: 'Master',
    description: 'Legendary quality with magical effects',
    effects: ['basic_portrait', 'subtle_glow', 'enhanced_lighting', 'dynamic_effects', 'magical_aura']
  },
  {
    level: 5,
    name: 'Transcendent',
    description: 'Reality-bending visual effects',
    effects: ['basic_portrait', 'subtle_glow', 'enhanced_lighting', 'dynamic_effects', 'magical_aura', 'reality_bend']
  }
];

// Calculate guild hall level based on legacy points and story beat
export function calculateGuildHallLevel(
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number },
  storyBeat: { act: number; visualStyle: string }
): number {
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  
  // Base level from legacy points
  let baseLevel = Math.floor(totalLegacy / 5);
  
  // Story beat can boost level
  const storyBeatBoost = storyBeat.act - 1;
  
  // Visual style can boost level
  const styleBoost = storyBeat.visualStyle === 'transcendent' ? 2 : 
                    storyBeat.visualStyle === 'legendary' ? 1 : 0;
  
  return Math.min(5, baseLevel + storyBeatBoost + styleBoost);
}

// Calculate character portrait level based on growth
export function calculatePortraitLevel(growth: number): number {
  if (growth >= 9) return 5; // Transcendent
  if (growth >= 7) return 4; // Master
  if (growth >= 5) return 3; // Expert
  if (growth >= 3) return 2; // Adept
  if (growth >= 1) return 1; // Apprentice
  return 0; // Novice
}

// Get visual progression state
export function getVisualProgression(
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number },
  storyBeat: { act: number; visualStyle: string },
  characterGrowth: Record<string, number> = {}
): VisualProgression {
  const guildHallLevel = calculateGuildHallLevel(legacyPoints, storyBeat);
  const guildHall = guildHallLevels[guildHallLevel] || guildHallLevels[0];
  
  // Calculate character portrait levels
  const characterPortraits: Record<string, string> = {};
  for (const [characterId, growth] of Object.entries(characterGrowth)) {
    const portraitLevel = calculatePortraitLevel(growth);
    const portraitLevelData = portraitEvolutionLevels[portraitLevel] || portraitEvolutionLevels[0];
    characterPortraits[characterId] = portraitLevelData.name;
  }
  
  // Determine event card style
  let eventCardStyle: 'basic' | 'enhanced' | 'legendary' | 'transcendent' = 'basic';
  if (storyBeat.visualStyle === 'transcendent') {
    eventCardStyle = 'transcendent';
  } else if (storyBeat.visualStyle === 'legendary') {
    eventCardStyle = 'legendary';
  } else if (storyBeat.visualStyle === 'enhanced') {
    eventCardStyle = 'enhanced';
  }
  
  return {
    guildHallLevel,
    characterPortraits,
    eventCardStyle,
    colorTheme: guildHall.color,
    effects: guildHall.effects
  };
}

// Get guild hall description with current level
export function getGuildHallDescription(level: number): string {
  const guildHall = guildHallLevels[level] || guildHallLevels[0];
  return `${guildHall.name}: ${guildHall.description}`;
}

// Get character portrait description
export function getCharacterPortraitDescription(level: number): string {
  const portraitLevel = portraitEvolutionLevels[level] || portraitEvolutionLevels[0];
  return `${portraitLevel.name}: ${portraitLevel.description}`;
}

// Get visual effects CSS classes
export function getVisualEffectsCSS(effects: string[]): string {
  const effectClasses: Record<string, string> = {
    'basic': '',
    'warm_glow': 'shadow-lg shadow-orange-200',
    'stone_texture': 'bg-gradient-to-br from-stone-200 to-stone-400',
    'marble_shine': 'bg-gradient-to-br from-white to-gray-100 shadow-xl',
    'crystal_glow': 'shadow-2xl shadow-blue-300',
    'floating_particles': 'animate-pulse',
    'basic_portrait': '',
    'subtle_glow': 'shadow-md shadow-blue-200',
    'enhanced_lighting': 'shadow-lg shadow-purple-200',
    'dynamic_effects': 'animate-bounce',
    'magical_aura': 'shadow-2xl shadow-pink-300',
    'reality_bend': 'animate-spin'
  };
  
  return effects.map(effect => effectClasses[effect] || '').join(' ');
}

// Get story beat transition animation
export function getStoryBeatTransitionAnimation(
  oldBeat: { act: number } | null, 
  newBeat: { act: number }
): string {
  if (!oldBeat || oldBeat.act === newBeat.act) {
    return '';
  }
  
  const animations = {
    1: 'animate-fade-in',
    2: 'animate-slide-up',
    3: 'animate-zoom-in',
    4: 'animate-reality-shift'
  };
  
  return animations[newBeat.act as keyof typeof animations] || 'animate-fade-in';
}
