const fs = require('fs');

const appFile = fs.readFileSync('src/App.tsx', 'utf8');
const typesFile = fs.readFileSync('src/types.ts', 'utf8');

let newTypes = typesFile.replace('export interface InputState {', `import type { CyberdeckDef } from './data/cyberdecks';

export interface InputState {`);

newTypes = newTypes.replace('uploadReduction: number; // Percentage, 0-100', `uploadReduction: number; // Percentage, 0-100
  selectedCyberdeckId: string;`);

fs.writeFileSync('src/types.ts', newTypes);

let newApp = appFile.replace('import type { InputState, PerkState, HackQueue, Quickhack } from \'./types\';',
`import type { InputState, PerkState, HackQueue, Quickhack } from './types';
import { CYBERDECKS } from './data/cyberdecks';`);

newApp = newApp.replace('uploadReduction: 0,', `uploadReduction: 0,
    selectedCyberdeckId: 'none',`);

fs.writeFileSync('src/App.tsx', newApp);
