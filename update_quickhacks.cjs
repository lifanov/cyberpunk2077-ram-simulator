const fs = require('fs');

const rawData = fs.readFileSync('src/data/quickhacks.ts', 'utf8');

// Use reasonable defaults based on parsed data and wiki knowledge.
// Tiers will scale slightly.
// Some instant hacks like Detonate Grenade or System Collapse or Suicide have duration 0 or 1s.
// Cyberpsychosis is permanent effectively, but let's say 60s. Memory Wipe T4/T5 varies.

const durations = {
  'Bait': 15,
  'Blackwall Gateway': 0, // Unimplemented
  'Contagion': { 2: 6, 3: 7, 4: 8, 5: 8, 'Iconic': 8 }, // Base spreads to 2, T3 spreads to 4.
  'Cripple Movement': 12,
  'Cyberpsychosis': 60,
  'Cyberware Malfunction': 10,
  'Detonate Grenade': 1,
  'Memory Wipe': { 3: 5, 4: 10, 5: 15, 'Iconic': 15 }, // Rough estimate, doesn't say exact on that page
  'Overheat': { 1: 5, 2: 5, 3: 5, 4: 6, 5: 6, 'Iconic': 6 },
  'Ping': { 1: 8, 2: 8, 3: 12, 4: 16, 5: 30, 'Iconic': 30 },
  'Reboot Optics': { 1: 8, 2: 8, 3: 10, 4: 12, 5: 15, 'Iconic': 15 },
  'Request Backup': 15,
  'Short Circuit': 3,
  'Sonic Shock': 20,
  'Suicide': 1,
  'Synapse Burnout': 3,
  'System Collapse': 1,
  'Weapon Glitch': 14
};

const updatedLines = [];
const lines = rawData.split('\n');

for (const line of lines) {
  if (line.includes('id: string;')) {
    updatedLines.push('  id: string;');
    continue;
  }
  if (line.includes('uploadTime: number;')) {
    updatedLines.push(line);
    updatedLines.push('  duration: number;');
    continue;
  }

  if (line.includes('{ id: \'')) {
    const nameMatch = line.match(/name: '([^']+)'/);
    const tierMatch = line.match(/tier: ([0-9]+|'Iconic')/);
    if (nameMatch && tierMatch) {
      const name = nameMatch[1];
      const tier = tierMatch[1] === "'Iconic'" ? 'Iconic' : parseInt(tierMatch[1]);

      let dur = 5; // fallback
      if (durations[name] !== undefined) {
        if (typeof durations[name] === 'object') {
          dur = durations[name][tier] || durations[name][Object.keys(durations[name])[0]]; // fallback to first key
        } else {
          dur = durations[name];
        }
      }

      const insertIdx = line.lastIndexOf('}');
      const newLine = line.slice(0, insertIdx) + `, duration: ${dur} ` + line.slice(insertIdx);
      updatedLines.push(newLine);
      continue;
    }
  }

  updatedLines.push(line);
}

fs.writeFileSync('src/data/quickhacks.ts', updatedLines.join('\n'));
console.log('Updated quickhacks.ts');

const typesData = fs.readFileSync('src/types.ts', 'utf8');
// Types is fine, QuickhackDef is updated.
