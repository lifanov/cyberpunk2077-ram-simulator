const fs = require('fs');

const appPath = 'src/App.tsx';
let data = fs.readFileSync(appPath, 'utf8');

const selectDeck = `<select className="w-48 bg-slate-800 border border-sky-700 text-sky-300 p-1"
                    value={inputs.selectedCyberdeckId}
                    onChange={e => {
                        const val = e.target.value;
                        const deck = CYBERDECKS.find(d => d.id === val);
                        setInputs({...inputs, selectedCyberdeckId: val, maxRam: deck ? deck.maxRam : inputs.maxRam})
                    }}>
              {CYBERDECKS.map(d => <option key={d.id} value={d.id} disabled={d.id === 'canto-mk6'}>{d.name}</option>)}
            </select>`;

data = data.replace(/<select className="w-48 bg-slate-800 border border-sky-700 text-sky-300 p-1"[\s\S]*?<\/select>/, selectDeck);

fs.writeFileSync(appPath, data);
