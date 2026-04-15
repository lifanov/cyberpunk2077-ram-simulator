const fs = require('fs');
let appFile = fs.readFileSync('src/App.tsx', 'utf8');

const cyberdeckSelectHtml = `
          <div className="flex flex-col gap-2">
            <label className="text-sky-300 font-bold text-sm uppercase tracking-wider">CYBERDECK</label>
            <select
              value={inputs.selectedCyberdeckId}
              onChange={(e) => {
                 const deckId = e.target.value;
                 const deck = CYBERDECKS.find(d => d.id === deckId);
                 setInputs(prev => ({
                   ...prev,
                   selectedCyberdeckId: deckId,
                   maxRam: deck ? deck.maxRam : prev.maxRam
                 }));
              }}
              className="bg-slate-900 border border-sky-800 rounded p-2 text-sky-100 font-mono outline-none focus:border-sky-500"
            >
              {CYBERDECKS.map(deck => (
                <option key={deck.id} value={deck.id}>{deck.name} ({deck.maxRam} RAM)</option>
              ))}
            </select>
          </div>
`;

appFile = appFile.replace(/<div className="flex flex-col gap-2">\s*<label className="text-sky-300 font-bold text-sm uppercase tracking-wider">MAX RAM<\/label>/,
`${cyberdeckSelectHtml}
          <div className="flex flex-col gap-2">
            <label className="text-sky-300 font-bold text-sm uppercase tracking-wider">MAX RAM</label>`);

appFile = appFile.replace(/<QueueSystem[\s\S]*?\/>/,
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

let typesFile = fs.readFileSync('src/types.ts', 'utf8');
typesFile = typesFile.replace(`import type { CyberdeckDef } from './data/cyberdecks';`, ``); // removed unused
fs.writeFileSync('src/types.ts', typesFile);
