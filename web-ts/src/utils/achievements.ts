// Achievement System - Clear progression goals and rewards
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'legacy' | 'survival' | 'chaos' | 'character' | 'story';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  unlocked: boolean;
  unlockedAt?: number; // Timestamp when unlocked
}

export interface AchievementRequirement {
  type: 'legacy_points' | 'survive_days' | 'chaos_events' | 'character_growth' | 'story_beat' | 'collapse_type';
  value: number;
  operator: '>=' | '==' | '<=' | '!=' | 'contains';
  target?: string; // For specific targets like collapse types
}

export interface AchievementReward {
  type: 'legacy_points' | 'unlock_content' | 'visual_effect' | 'title';
  value: number | string;
  description: string;
}

// Define all achievements
export const achievements: Achievement[] = [
  // Legacy Achievements
  {
    id: 'first_collapse',
    name: 'First Steps',
    description: 'Experience your first guild collapse',
    category: 'legacy',
    rarity: 'common',
    requirements: [{ type: 'legacy_points', value: 1, operator: '>=' }],
    rewards: [{ type: 'title', value: 'Novice Guildmaster', description: 'Unlocked title: Novice Guildmaster' }],
    unlocked: false
  },
  {
    id: 'martyr_legend',
    name: 'The Martyr',
    description: 'Achieve 5 Martyr collapses (high reputation, low funds)',
    category: 'legacy',
    rarity: 'uncommon',
    requirements: [{ type: 'collapse_type', value: 5, operator: '>=', target: 'martyr' }],
    rewards: [{ type: 'title', value: 'The Martyr', description: 'Unlocked title: The Martyr' }],
    unlocked: false
  },
  {
    id: 'pragmatist_master',
    name: 'The Pragmatist',
    description: 'Achieve 5 Pragmatist collapses (balanced)',
    category: 'legacy',
    rarity: 'uncommon',
    requirements: [{ type: 'collapse_type', value: 5, operator: '>=', target: 'pragmatist' }],
    rewards: [{ type: 'title', value: 'The Pragmatist', description: 'Unlocked title: The Pragmatist' }],
    unlocked: false
  },
  {
    id: 'dreamer_visionary',
    name: 'The Dreamer',
    description: 'Achieve 5 Dreamer collapses (high readiness, low reputation)',
    category: 'legacy',
    rarity: 'uncommon',
    requirements: [{ type: 'collapse_type', value: 5, operator: '>=', target: 'dreamer' }],
    rewards: [{ type: 'title', value: 'The Dreamer', description: 'Unlocked title: The Dreamer' }],
    unlocked: false
  },
  {
    id: 'survivor_endurance',
    name: 'The Survivor',
    description: 'Achieve 5 Survivor collapses (deck exhaustion)',
    category: 'legacy',
    rarity: 'uncommon',
    requirements: [{ type: 'collapse_type', value: 5, operator: '>=', target: 'survivor' }],
    rewards: [{ type: 'title', value: 'The Survivor', description: 'Unlocked title: The Survivor' }],
    unlocked: false
  },
  {
    id: 'legend_ascended',
    name: 'The Legend',
    description: 'Achieve 5 Legend collapses (high all meters)',
    category: 'legacy',
    rarity: 'rare',
    requirements: [{ type: 'collapse_type', value: 5, operator: '>=', target: 'legend' }],
    rewards: [{ type: 'title', value: 'The Legend', description: 'Unlocked title: The Legend' }],
    unlocked: false
  },
  {
    id: 'legacy_master',
    name: 'Legacy Master',
    description: 'Achieve 50 total legacy points',
    category: 'legacy',
    rarity: 'epic',
    requirements: [{ type: 'legacy_points', value: 50, operator: '>=' }],
    rewards: [{ type: 'title', value: 'Legacy Master', description: 'Unlocked title: Legacy Master' }],
    unlocked: false
  },

  // Survival Achievements
  {
    id: 'survivor_week',
    name: 'Week Warrior',
    description: 'Survive for 7 days in a single run',
    category: 'survival',
    rarity: 'common',
    requirements: [{ type: 'survive_days', value: 7, operator: '>=' }],
    rewards: [{ type: 'visual_effect', value: 'survivor_glow', description: 'Unlocked visual effect: Survivor Glow' }],
    unlocked: false
  },
  {
    id: 'survivor_month',
    name: 'Month Master',
    description: 'Survive for 30 days in a single run',
    category: 'survival',
    rarity: 'rare',
    requirements: [{ type: 'survive_days', value: 30, operator: '>=' }],
    rewards: [{ type: 'title', value: 'Month Master', description: 'Unlocked title: Month Master' }],
    unlocked: false
  },
  {
    id: 'survivor_legend',
    name: 'Survival Legend',
    description: 'Survive for 50 days in a single run',
    category: 'survival',
    rarity: 'legendary',
    requirements: [{ type: 'survive_days', value: 50, operator: '>=' }],
    rewards: [{ type: 'title', value: 'Survival Legend', description: 'Unlocked title: Survival Legend' }],
    unlocked: false
  },

  // Chaos Achievements
  {
    id: 'chaos_witness',
    name: 'Chaos Witness',
    description: 'Experience your first chaos event',
    category: 'chaos',
    rarity: 'common',
    requirements: [{ type: 'chaos_events', value: 1, operator: '>=' }],
    rewards: [{ type: 'visual_effect', value: 'chaos_aura', description: 'Unlocked visual effect: Chaos Aura' }],
    unlocked: false
  },
  {
    id: 'chaos_master',
    name: 'Chaos Master',
    description: 'Experience 10 chaos events',
    category: 'chaos',
    rarity: 'uncommon',
    requirements: [{ type: 'chaos_events', value: 10, operator: '>=' }],
    rewards: [{ type: 'title', value: 'Chaos Master', description: 'Unlocked title: Chaos Master' }],
    unlocked: false
  },
  {
    id: 'reality_bender',
    name: 'Reality Bender',
    description: 'Experience 5 reality-bending chaos events',
    category: 'chaos',
    rarity: 'epic',
    requirements: [{ type: 'chaos_events', value: 5, operator: '>=', target: 'reality_bending' }],
    rewards: [{ type: 'title', value: 'Reality Bender', description: 'Unlocked title: Reality Bender' }],
    unlocked: false
  },

  // Character Achievements
  {
    id: 'character_mentor',
    name: 'Character Mentor',
    description: 'Help a character reach maximum growth',
    category: 'character',
    rarity: 'uncommon',
    requirements: [{ type: 'character_growth', value: 10, operator: '>=' }],
    rewards: [{ type: 'title', value: 'Character Mentor', description: 'Unlocked title: Character Mentor' }],
    unlocked: false
  },
  {
    id: 'relationship_master',
    name: 'Relationship Master',
    description: 'Develop 5 character relationships',
    category: 'character',
    rarity: 'rare',
    requirements: [{ type: 'character_growth', value: 5, operator: '>=', target: 'relationships' }],
    rewards: [{ type: 'title', value: 'Relationship Master', description: 'Unlocked title: Relationship Master' }],
    unlocked: false
  },

  // Story Achievements
  {
    id: 'foundation_builder',
    name: 'Foundation Builder',
    description: 'Complete Act 1 (The Foundation)',
    category: 'story',
    rarity: 'common',
    requirements: [{ type: 'story_beat', value: 1, operator: '>=' }],
    rewards: [{ type: 'visual_effect', value: 'foundation_glow', description: 'Unlocked visual effect: Foundation Glow' }],
    unlocked: false
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Complete Act 2 (The Rise)',
    category: 'story',
    rarity: 'uncommon',
    requirements: [{ type: 'story_beat', value: 2, operator: '>=' }],
    rewards: [{ type: 'title', value: 'Rising Star', description: 'Unlocked title: Rising Star' }],
    unlocked: false
  },
  {
    id: 'legendary_guildmaster',
    name: 'Legendary Guildmaster',
    description: 'Complete Act 3 (The Legend)',
    category: 'story',
    rarity: 'rare',
    requirements: [{ type: 'story_beat', value: 3, operator: '>=' }],
    rewards: [{ type: 'title', value: 'Legendary Guildmaster', description: 'Unlocked title: Legendary Guildmaster' }],
    unlocked: false
  },
  {
    id: 'transcendent_being',
    name: 'Transcendent Being',
    description: 'Complete Act 4 (The Transcendence)',
    category: 'story',
    rarity: 'legendary',
    requirements: [{ type: 'story_beat', value: 4, operator: '>=' }],
    rewards: [{ type: 'title', value: 'Transcendent Being', description: 'Unlocked title: Transcendent Being' }],
    unlocked: false
  }
];

// Check if an achievement should be unlocked
export function checkAchievement(
  achievement: Achievement,
  gameState: {
    legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number };
    maxSurvivedDays: number;
    chaosEventsExperienced: number;
    characterGrowth: Record<string, number>;
    currentStoryBeat: number;
    collapseHistory: Array<{ collapseType: string; day: number }>;
  }
): boolean {
  if (achievement.unlocked) return false;
  
  return achievement.requirements.every(req => {
    switch (req.type) {
      case 'legacy_points':
        const totalLegacy = Object.values(gameState.legacyPoints).reduce((a, b) => a + b, 0);
        return compareValues(totalLegacy, req.value, req.operator);
      
      case 'survive_days':
        return compareValues(gameState.maxSurvivedDays, req.value, req.operator);
      
      case 'chaos_events':
        return compareValues(gameState.chaosEventsExperienced, req.value, req.operator);
      
      case 'character_growth':
        if (req.target === 'relationships') {
          // Count characters with relationships
          const relationshipCount = Object.values(gameState.characterGrowth).filter(growth => growth > 5).length;
          return compareValues(relationshipCount, req.value, req.operator);
        }
        const maxGrowth = Math.max(...Object.values(gameState.characterGrowth), 0);
        return compareValues(maxGrowth, req.value, req.operator);
      
      case 'story_beat':
        return compareValues(gameState.currentStoryBeat, req.value, req.operator);
      
      case 'collapse_type':
        const collapseCount = gameState.collapseHistory.filter(c => c.collapseType === req.target).length;
        return compareValues(collapseCount, req.value, req.operator);
      
      default:
        return false;
    }
  });
}

// Helper function to compare values
function compareValues(actual: number, expected: number, operator: string): boolean {
  switch (operator) {
    case '>=': return actual >= expected;
    case '==': return actual === expected;
    case '<=': return actual <= expected;
    case '!=': return actual !== expected;
    default: return false;
  }
}

// Get achievement progress (0-1)
export function getAchievementProgress(
  achievement: Achievement,
  gameState: {
    legacyPoints: { martyr: number; pragmatist: number; dreamer: number; survivor: number; legend: number };
    maxSurvivedDays: number;
    chaosEventsExperienced: number;
    characterGrowth: Record<string, number>;
    currentStoryBeat: number;
    collapseHistory: Array<{ collapseType: string; day: number }>;
  }
): number {
  if (achievement.unlocked) return 1;
  
  const progress = achievement.requirements.map(req => {
    switch (req.type) {
      case 'legacy_points':
        const totalLegacy = Object.values(gameState.legacyPoints).reduce((a, b) => a + b, 0);
        return Math.min(1, totalLegacy / req.value);
      
      case 'survive_days':
        return Math.min(1, gameState.maxSurvivedDays / req.value);
      
      case 'chaos_events':
        return Math.min(1, gameState.chaosEventsExperienced / req.value);
      
      case 'character_growth':
        if (req.target === 'relationships') {
          const relationshipCount = Object.values(gameState.characterGrowth).filter(growth => growth > 5).length;
          return Math.min(1, relationshipCount / req.value);
        }
        const maxGrowth = Math.max(...Object.values(gameState.characterGrowth), 0);
        return Math.min(1, maxGrowth / req.value);
      
      case 'story_beat':
        return Math.min(1, gameState.currentStoryBeat / req.value);
      
      case 'collapse_type':
        const collapseCount = gameState.collapseHistory.filter(c => c.collapseType === req.target).length;
        return Math.min(1, collapseCount / req.value);
      
      default:
        return 0;
    }
  });
  
  return progress.reduce((a, b) => a + b, 0) / progress.length;
}

// Get achievement rarity color
export function getAchievementRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'text-gray-400';
    case 'uncommon': return 'text-green-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
}

// Get achievement category icon
export function getAchievementCategoryIcon(category: string): string {
  switch (category) {
    case 'legacy': return '🏆';
    case 'survival': return '⏰';
    case 'chaos': return '🌟';
    case 'character': return '👥';
    case 'story': return '📖';
    default: return '🏆';
  }
}
