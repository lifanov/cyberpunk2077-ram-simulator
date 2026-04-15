const fs = require('fs');

// We need data for Cyberdecks. Let's just create a curated list of iconic/legendary cyberdecks
// from Cyberpunk 2077 patch 2.0+ since that's what's currently relevant.
//
// Common Tier 5/Iconic Cyberdecks and their effects:
// 1. Arasaka Mk.5: -2 RAM cost for Covert quickhacks. +5 Max RAM.
// 2. Biotech Σ Mk.5: +10% to all quickhack damage. +6 Max RAM.
// 3. Militech Paraline Mk.5: +10% Monowire damage, +6 Max RAM.
// 4. NetWatch Netdriver Mk.5: -20% Traceability. -50% Upload time for Combat Quickhacks.
// 5. Raven Microcyber Mk.5: +15% quickhack spread distance. +100% upload speed for quickhacks against enemies affected by a quickhack.
// 6. Tetratronic Rippler Mk.5: +15% Max RAM, +40% damage for combat quickhacks immediately followed by a non-combat quickhack.
// 7. Stephenson Tech Mk.5: -30% cooldown for all quickhacks.

const CYBERDECKS = [
  { id: 'none', name: 'None (Base Stats)', maxRam: 10, bonus: {} },
  { id: 'arasaka-mk5', name: 'Arasaka Mk.5 (Tier 5)', maxRam: 14, bonus: { covertRamDiscount: 2 } },
  { id: 'biotech-mk5', name: 'Biotech Σ Mk.5 (Tier 5)', maxRam: 15, bonus: {} },
  { id: 'netwatch-mk5', name: 'NetWatch Netdriver Mk.5 (Tier 5)', maxRam: 13, bonus: { combatUploadReduction: 0.5 } }, // -50% combat upload time
  { id: 'raven-mk5', name: 'Raven Microcyber Mk.5 (Tier 5)', maxRam: 12, bonus: {} }, // 100% upload speed = 50% upload time if affected by quickhack (complex to sim)
  { id: 'tetratronic-mk5', name: 'Tetratronic Rippler Mk.5 (Tier 5)', maxRam: 16, bonus: {} },
  { id: 'stephenson-mk5', name: 'Stephenson Tech Mk.5 (Tier 5)', maxRam: 13, bonus: {} },
];

let out = `export interface CyberdeckDef {
  id: string;
  name: string;
  maxRam: number;
  bonus: {
    covertRamDiscount?: number;
    combatUploadReduction?: number; // decimal e.g. 0.5 for 50%
  };
}

export const CYBERDECKS: CyberdeckDef[] = ${JSON.stringify(CYBERDECKS, null, 2)};
`;

fs.writeFileSync('cp-ram-sim/src/data/cyberdecks.ts', out);
console.log('src/data/cyberdecks.ts created.');
