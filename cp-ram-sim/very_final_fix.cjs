const fs = require('fs');
let appFile = fs.readFileSync('src/App.tsx', 'utf8');

const deckHtml = `          <label className="flex justify-between items-center">
            <span>Cyberdeck:</span>
            <select className="w-48 bg-slate-800 border border-sky-700 text-sky-300 p-1"
                    value={inputs.selectedCyberdeckId}
                    onChange={e => {
                        const val = e.target.value;
                        const deck = CYBERDECKS.find(d => d.id === val);
                        setInputs({...inputs, selectedCyberdeckId: val, maxRam: deck ? deck.maxRam : inputs.maxRam})
                    }}>
              {CYBERDECKS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>`;

appFile = appFile.replace(/<label className="flex justify-between items-center">\s*<span>Max RAM:<\/span>/,
`${deckHtml}\n          <label className="flex justify-between items-center">\n            <span>Max RAM:</span>`);

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
console.log('patched again!');
