// Story Beats System - Different narrative phases that change the game's feel
export interface StoryBeat {
  act: 1 | 2 | 3 | 4;
  dayRange: [number, number];
  theme: string;
  focus: string;
  chaosLevel: 'low' | 'mid' | 'high' | 'reality_bending';
  description: string;
  visualStyle: 'basic' | 'enhanced' | 'legendary' | 'transcendent';
  eventModifiers: {
    council: number;
    rival: number;
    maintenance: number;
    archetype: number;
    chaos: number;
  };
}

// Define the four acts of the guild's journey
export const storyBeats: StoryBeat[] = [
  {
    act: 1,
    dayRange: [1, 6],
    theme: 'The Foundation',
    focus: 'Building the guild from nothing',
    chaosLevel: 'low',
    description: 'The early days of guild formation. Everything is new and uncertain.',
    visualStyle: 'basic',
    eventModifiers: {
      council: 0.3,      // Suppress council pressure early
      rival: 0.5,        // Rival events less likely
      maintenance: 0.6,  // Maintenance events less likely
      archetype: 1.5,    // Favor character introduction events
      chaos: 0.5         // Lower chaos chance
    }
  },
  {
    act: 2,
    dayRange: [7, 12],
    theme: 'The Rise',
    focus: 'The guild becomes a force to be reckoned with',
    chaosLevel: 'mid',
    description: 'The guild gains recognition and faces its first real challenges.',
    visualStyle: 'enhanced',
    eventModifiers: {
      council: 1.0,      // Normal council pressure
      rival: 1.2,        // Rival events more likely
      maintenance: 1.0,  // Normal maintenance
      archetype: 1.0,    // Normal archetype events
      chaos: 1.0         // Normal chaos chance
    }
  },
  {
    act: 3,
    dayRange: [13, 18],
    theme: 'The Legend',
    focus: 'The guild becomes legendary',
    chaosLevel: 'high',
    description: 'The guild faces epic challenges and world-changing decisions.',
    visualStyle: 'legendary',
    eventModifiers: {
      council: 1.5,      // Higher council pressure
      rival: 1.0,        // Normal rival events
      maintenance: 1.3,  // More maintenance pressure
      archetype: 0.8,    // Fewer basic archetype events
      chaos: 1.5         // Higher chaos chance
    }
  },
  {
    act: 4,
    dayRange: [19, 999],
    theme: 'The Transcendence',
    focus: 'The guild transcends mortality',
    chaosLevel: 'reality_bending',
    description: 'The guild faces reality-bending challenges and cosmic implications.',
    visualStyle: 'transcendent',
    eventModifiers: {
      council: 2.0,      // Maximum council pressure
      rival: 0.8,        // Fewer rival events
      maintenance: 1.5,  // High maintenance pressure
      archetype: 0.5,    // Few basic archetype events
      chaos: 2.0         // Maximum chaos chance
    }
  }
];

// Get the current story beat based on day
export function getCurrentStoryBeat(day: number): StoryBeat {
  return storyBeats.find(beat => 
    day >= beat.dayRange[0] && day <= beat.dayRange[1]
  ) || storyBeats[storyBeats.length - 1]; // Fallback to last beat
}

// Get story beat progression (0-1)
export function getStoryBeatProgress(day: number): number {
  const currentBeat = getCurrentStoryBeat(day);
  const [startDay, endDay] = currentBeat.dayRange;
  
  if (endDay === 999) {
    // For the transcendent act, progress based on milestones
    return Math.min(1, (day - startDay) / 10);
  }
  
  return Math.min(1, (day - startDay) / (endDay - startDay));
}

// Get visual style based on story beat and legacy points
export function getVisualStyle(
  storyBeat: StoryBeat, 
  legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number }
): string {
  const totalLegacy = Object.values(legacyPoints).reduce((a, b) => a + b, 0);
  
  // Legacy points can upgrade visual style
  if (totalLegacy >= 20) {
    return 'transcendent';
  } else if (totalLegacy >= 10) {
    return 'legendary';
  } else if (totalLegacy >= 5) {
    return 'enhanced';
  }
  
  return storyBeat.visualStyle;
}

// Get story beat color theme
export function getStoryBeatColorTheme(storyBeat: StoryBeat): string {
  switch (storyBeat.act) {
    case 1:
      return 'from-green-400 to-blue-400'; // Foundation - growth colors
    case 2:
      return 'from-blue-400 to-purple-400'; // Rise - power colors
    case 3:
      return 'from-purple-400 to-pink-400'; // Legend - epic colors
    case 4:
      return 'from-pink-400 to-yellow-400'; // Transcendence - cosmic colors
    default:
      return 'from-gray-400 to-gray-600';
  }
}

// Get story beat description with current progress
export function getStoryBeatDescription(storyBeat: StoryBeat, day: number): string {
  const progress = getStoryBeatProgress(day);
  const progressPercent = Math.round(progress * 100);
  
  return `${storyBeat.description} (${progressPercent}% through ${storyBeat.theme})`;
}

// Get event weight modifier based on story beat
export function getEventWeightModifier(
  eventType: 'council' | 'rival' | 'maintenance' | 'archetype' | 'chaos',
  storyBeat: StoryBeat
): number {
  return storyBeat.eventModifiers[eventType] || 1.0;
}

// Get chaos level description
export function getChaosLevelDescription(chaosLevel: string): string {
  switch (chaosLevel) {
    case 'low':
      return 'Stable and predictable';
    case 'mid':
      return 'Some unexpected twists';
    case 'high':
      return 'Reality begins to bend';
    case 'reality_bending':
      return 'The very fabric of existence trembles';
    default:
      return 'Unknown chaos level';
  }
}

// Get story beat transition message
export function getStoryBeatTransitionMessage(
  oldBeat: StoryBeat | null, 
  newBeat: StoryBeat
): string {
  if (!oldBeat || oldBeat.act === newBeat.act) {
    return '';
  }
  
  const transitions = {
    1: 'The foundation is set. The guild begins its rise...',
    2: 'The guild has gained recognition. Legendary challenges await...',
    3: 'The guild has become legendary. Reality itself begins to shift...',
    4: 'The guild transcends mortality. The cosmos trembles...'
  };
  
  return transitions[newBeat.act as keyof typeof transitions] || '';
}
