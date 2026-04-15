const fs = require('fs');
const hacks = JSON.parse(fs.readFileSync('parsed_hacks_final.json', 'utf8'));

let out = `export type QuickhackCategory = 'Control' | 'Covert' | 'Combat' | 'Ultimate';
export type QuickhackTier = 1 | 2 | 3 | 4 | 5 | 'Iconic';

export interface QuickhackDef {
  id: string;
  name: string;
  category: QuickhackCategory;
  tier: QuickhackTier;
  baseCost: number;
  uploadTime: number;
}

export const QUICKHACKS: QuickhackDef[] = [
`;

for (const hack of hacks) {
    for (const tier of hack.availableTiers) {
        const cost = hack.ramCost[tier] || 0;
        const upload = hack.uploadTime[tier] || 0;
        const idStr = `${hack.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-t${tier === 'Iconic' ? 'iconic' : tier}`;
        out += `  { id: '${idStr}', name: '${hack.name}', category: '${hack.category}', tier: ${typeof tier === 'string' ? "'Iconic'" : tier}, baseCost: ${cost}, uploadTime: ${upload} },\n`;
    }
}

out += `];\n`;
fs.writeFileSync('src/data/quickhacks.ts', out);
console.log('src/data/quickhacks.ts updated.');
