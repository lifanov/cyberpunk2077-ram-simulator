const fs = require('fs');

let queueFile = fs.readFileSync('src/components/QueueSystem.tsx', 'utf8');

// We need to pass the selected cyberdeck to QueueSystem so it can calculate costs
queueFile = queueFile.replace('import type { HackQueue, PerkState, Quickhack, QueueItem } from \'../types\';',
`import type { HackQueue, PerkState, Quickhack, QueueItem, InputState } from '../types';
import { CYBERDECKS } from '../data/cyberdecks';`);

queueFile = queueFile.replace('perks: PerkState;\n}', `perks: PerkState;
  inputs: InputState;
}`);

queueFile = queueFile.replace('export function QueueSystem({ queues, setQueues, activeQueueId, setActiveQueueId, cyberdeck, currentRAM, setCurrentRAM, perks }: QueueSystemProps) {',
`export function QueueSystem({ queues, setQueues, activeQueueId, setActiveQueueId, cyberdeck, currentRAM, setCurrentRAM, perks, inputs }: QueueSystemProps) {`);

queueFile = queueFile.replace('const calculateCost = (hack: Quickhack, isFourthSlot: boolean) => {',
`const calculateCost = (hack: Quickhack, isFourthSlot: boolean) => {
    let cost = hack.baseCost;

    // Apply Cyberdeck modifiers
    const activeDeck = CYBERDECKS.find(d => d.id === inputs.selectedCyberdeckId);
    if (activeDeck && activeDeck.bonus.covertRamDiscount && hack.category === 'Covert') {
        cost = Math.max(1, cost - activeDeck.bonus.covertRamDiscount);
    }
`);

queueFile = queueFile.replace('if (isFourthSlot && perks.queueMastery) {',
`if (isFourthSlot && perks.queueMastery) {
      return Math.max(1, Math.floor(cost / 2));
    }
    return cost;
`);

queueFile = queueFile.replace('return hack.baseCost;', '');

// Fix Upload Time reduction in App.tsx
let appFile = fs.readFileSync('src/App.tsx', 'utf8');

appFile = appFile.replace('const uploadSpeedMultiplier = 1 + (inputs.uploadReduction / 100);',
`const activeDeck = CYBERDECKS.find(d => d.id === inputs.selectedCyberdeckId);

        let uploadSpeedMultiplier = 1 + (inputs.uploadReduction / 100);
        // Instead of modifying upload time globally here, cyberdeck modifiers are usually specific to quickhack types.
        // Wait, netwatch reduces *time*, not increases *speed* for combat hacks.
        // If the hack is combat and netwatch is selected, time remaining reduces faster, or total time is halved when added.
        // Since time is tracked per item, reducing time remaining when added is better, or applying it during the tick.
        `);

fs.writeFileSync('src/components/QueueSystem.tsx', queueFile);
fs.writeFileSync('src/App.tsx', appFile);
console.log('patched QueueSystem.tsx and App.tsx');
