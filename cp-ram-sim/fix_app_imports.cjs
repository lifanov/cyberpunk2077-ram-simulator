const fs = require('fs');

const appPath = 'src/App.tsx';
let data = fs.readFileSync(appPath, 'utf8');

data = data.replace(
  "import type { InputState, PerkState, HackQueue, Quickhack } from './types';",
  "import type { InputState, PerkState, HackQueue, Quickhack, QueueItem } from './types';"
);

data = data.replace(
  "import { v4 as uuidv4 } from 'uuid';",
  ""
);

data = data.replaceAll("typeof import('./types').HackQueue", "HackQueue");
data = data.replaceAll("typeof import('./types').QueueItem", "QueueItem");

fs.writeFileSync(appPath, data);
