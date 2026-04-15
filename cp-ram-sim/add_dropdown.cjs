const fs = require('fs');

let appFile = fs.readFileSync('src/App.tsx', 'utf8');

// Add the selector to the UI
const cyberdeckSelectHtml = `
          <div className="flex flex-col gap-2">
            <label className="text-sky-300 font-bold text-sm uppercase tracking-wider">CYBERDECK</label>
            <select
              value={inputs.selectedCyberdeckId}
              onChange={(e) => {
                 setInputs(prev => ({...prev, selectedCyberdeckId: e.target.value}));
                 const deck = CYBERDECKS.find(d => d.id === e.target.value);
                 if (deck && deck.maxRam !== prev.maxRam) {
                     // Optionally update max RAM when deck changes
                     // We will let user manually override maxRam, but let's set it to deck's maxRam if changed
                     setInputs(p => ({...p, maxRam: deck.maxRam, selectedCyberdeckId: e.target.value}));
                 }
              }}
              className="bg-slate-900 border border-sky-800 rounded p-2 text-sky-100 font-mono outline-none focus:border-sky-500"
            >
              {CYBERDECKS.map(deck => (
                <option key={deck.id} value={deck.id}>{deck.name} ({deck.maxRam} RAM)</option>
              ))}
            </select>
          </div>
`;

// Insert the HTML into the app right before max RAM
appFile = appFile.replace(`<div className="flex flex-col gap-2">
            <label className="text-sky-300 font-bold text-sm uppercase tracking-wider">MAX RAM</label>`,
`${cyberdeckSelectHtml}
          <div className="flex flex-col gap-2">
            <label className="text-sky-300 font-bold text-sm uppercase tracking-wider">MAX RAM</label>`);

// Also we need to pass `inputs` to QueueSystem
appFile = appFile.replace(`<QueueSystem
            queues={queues}
            setQueues={setQueues}
            activeQueueId={activeQueueId}
            setActiveQueueId={setActiveQueueId}
            cyberdeck={cyberdeck}
            currentRAM={currentRAM}
            setCurrentRAM={setCurrentRAM}
            perks={perks}
          />`,
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
console.log('dropdown added');
