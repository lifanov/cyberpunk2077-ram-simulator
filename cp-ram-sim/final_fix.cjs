const fs = require('fs');

let appFile = fs.readFileSync('src/App.tsx', 'utf8');
let queueFile = fs.readFileSync('src/components/QueueSystem.tsx', 'utf8');

// 1. Remove unused CYBERDECKS in App.tsx (Wait, it's used in the dropdown, why does it complain?)
// Ah, because in App.tsx we replaced CYBERDECKS usage in the simulation loop, so it's only used in the dropdown. Let's check where the dropdown was added.
console.log(appFile.includes('CYBERDECKS.map')); // if false, the replace failed

// 2. QueueSystem.tsx needs to accept 'inputs' in App.tsx correctly.
// Let's re-insert inputs.
appFile = appFile.replace(/<QueueSystem\s+queues={queues}\s+setQueues={setQueues}\s+activeQueueId={activeQueueId}\s+setActiveQueueId={setActiveQueueId}\s+cyberdeck={cyberdeck}\s+currentRAM={currentRAM}\s+setCurrentRAM={setCurrentRAM}\s+perks={perks}\s+\/>/g,
`<QueueSystem
            queues={queues}
            setQueues={setQueues}
            activeQueueId={activeQueueId}
            setActiveQueueId={setActiveQueueId}
            cyberdeck={cyberdeck}
            currentRAM={currentRAM}
            setCurrentRAM={setCurrentRAM}
            perks={perks}
            inputs={inputs}
          />`);

fs.writeFileSync('src/App.tsx', appFile);
