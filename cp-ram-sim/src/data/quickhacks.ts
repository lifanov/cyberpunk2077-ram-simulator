export type QuickhackCategory = 'Control' | 'Covert' | 'Combat' | 'Ultimate';
export type QuickhackTier = 1 | 2 | 3 | 4 | 5;

export interface QuickhackDef {
  id: string;
  name: string;
  category: QuickhackCategory;
  tier: QuickhackTier;
  baseCost: number;
  uploadTime: number;
}

const generateHacks = (name: string, category: QuickhackCategory, baseCosts: number[], uploadTimes: number[]): QuickhackDef[] => {
  return baseCosts.map((cost, index) => ({
    id: `${name.replace(/\s+/g, '-').toLowerCase()}-t${index + 1}`,
    name,
    category,
    tier: (index + 1) as QuickhackTier,
    baseCost: cost,
    uploadTime: uploadTimes[index] || uploadTimes[uploadTimes.length - 1], // fallback if missing
  }));
};

// Base costs and upload times are somewhat approximated/scaled for a simulation
export const QUICKHACKS: QuickhackDef[] = [
  ...generateHacks('Ping', 'Covert', [2, 3, 4, 5, 6], [1.5, 1.5, 2, 2, 2.5]),
  ...generateHacks('Reboot Optics', 'Covert', [3, 4, 5, 6, 7], [2, 2, 2.5, 3, 3.5]),
  ...generateHacks('Memory Wipe', 'Covert', [4, 6, 8, 10, 14], [2, 2.5, 3, 3.5, 4]),
  ...generateHacks('Sonic Shock', 'Covert', [2, 3, 4, 5, 6], [1.5, 2, 2, 2.5, 3]),

  ...generateHacks('Short Circuit', 'Combat', [3, 4, 5, 6, 7], [1.5, 1.5, 2, 2.5, 3]),
  ...generateHacks('Overheat', 'Combat', [3, 4, 5, 6, 7], [2, 2.5, 3, 3.5, 4]),
  ...generateHacks('Contagion', 'Combat', [4, 5, 6, 7, 8], [2.5, 3, 3.5, 4, 4.5]),
  ...generateHacks('Synapse Burnout', 'Combat', [4, 5, 6, 7, 8], [2, 2.5, 3, 3.5, 4]),

  ...generateHacks('Cyberware Malfunction', 'Control', [3, 4, 5, 6, 7], [1.5, 1.5, 2, 2.5, 3]),
  ...generateHacks('Cripple Movement', 'Control', [3, 4, 5, 6, 7], [2, 2.5, 3, 3.5, 4]),
  ...generateHacks('Weapon Glitch', 'Control', [3, 4, 5, 6, 7], [1.5, 2, 2.5, 3, 3.5]),

  // Ultimates usually don't have lower tiers, but we can provide them as placeholders or start at tier 3/4/5
  ...generateHacks('Suicide', 'Ultimate', [10, 12, 14, 18, 24], [5, 6, 7, 8, 10]),
  ...generateHacks('System Collapse', 'Ultimate', [10, 12, 14, 18, 24], [5, 6, 7, 8, 10]),
  ...generateHacks('Detonate Grenade', 'Ultimate', [10, 12, 14, 18, 24], [4, 5, 6, 7, 8]),
  ...generateHacks('Cyberpsychosis', 'Ultimate', [10, 12, 14, 18, 24], [5, 6, 7, 8, 10]),
];
