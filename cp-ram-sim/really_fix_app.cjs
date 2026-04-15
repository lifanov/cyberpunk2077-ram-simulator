const fs = require('fs');
let appFile = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<label className="text-sky-300 font-bold text-sm uppercase tracking-wider">MAX RAM<\/label>/g;
const match = appFile.match(regex);
console.log('Matches:', match?.length);

const deckHtml = `
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
          </div>`;

appFile = appFile.replace(/<div className="flex flex-col gap-2">\s*<label className="text-sky-300 font-bold text-sm uppercase tracking-wider">MAX RAM<\/label>/,
`${deckHtml}\n          <div className="flex flex-col gap-2">\n            <label className="text-sky-300 font-bold text-sm uppercase tracking-wider">MAX RAM</label>`);

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
