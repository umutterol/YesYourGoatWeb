// Speaker to portrait mapping for consistent character representation
export const SPEAKER_PORTRAIT_MAP: Record<string, string> = {
  // Core canonical speakers
  'Treasurer': '/resources/portraits/archmage.png',
  'Bard': '/resources/portraits/darkranger.png',
  'Recruiter': '/resources/portraits/paladin.png',
  'Tank': '/resources/portraits/mountainking.png',
  'Mage': '/resources/portraits/sorceress.png',
  'Arcanist': '/resources/portraits/bloodmage.png',
  'Officer': '/resources/portraits/chieftain.png',
  'Council Moderator': '/resources/portraits/keeper.png',
  'Dev Liaison': '/resources/portraits/tinker.png',
  'Streamer': '/resources/portraits/priestess.png',
  
  // Meta event speakers
  'Moderator': '/resources/portraits/keeper.png',
  'Council': '/resources/portraits/keeper.png',
  'Rival': '/resources/portraits/dreadlord.png',
  
  // Journey milestone speakers
  'Dungeon Master': '/resources/portraits/lich.png',
  'Guide': '/resources/portraits/farseer.png',
  
  // Fallback speakers
  'Speaker': '/resources/portraits/peon.png',
  'Unknown': '/resources/portraits/peon.png',
  
  // Race-specific speakers (if needed)
  'Ogrrynn Commander': '/resources/portraits/chieftain.png',
  'Dwarven Merchant': '/resources/portraits/tinker.png',
  'Elven Shaman': '/resources/portraits/farseer.png',
  'Human Diplomat': '/resources/portraits/paladin.png',
};

// Get portrait for a speaker, with fallback
export const getPortraitForSpeaker = (speaker?: string): string => {
  if (!speaker) return SPEAKER_PORTRAIT_MAP['Unknown'];
  return SPEAKER_PORTRAIT_MAP[speaker] || SPEAKER_PORTRAIT_MAP['Unknown'];
};

// Get all available portraits
export const getAllPortraits = (): string[] => {
  return Object.values(SPEAKER_PORTRAIT_MAP);
};

// Get all speakers
export const getAllSpeakers = (): string[] => {
  return Object.keys(SPEAKER_PORTRAIT_MAP);
};
