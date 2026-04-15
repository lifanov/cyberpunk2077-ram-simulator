const fs = require('fs');
let appFile = fs.readFileSync('src/App.tsx', 'utf8');

// I'll just find the exact spot manually by finding "MAX RAM" string and replacing
let lines = appFile.split('\n');
let maxRamLineIndex = lines.findIndex(l => l.includes('MAX RAM'));

if (maxRamLineIndex !== -1) {
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

    // Insert before maxRam line - 1 (the <div className="flex flex-col gap-2">)
    lines.splice(maxRamLineIndex - 1, 0, deckHtml);
}

appFile = lines.join('\n');
fs.writeFileSync('src/App.tsx', appFile);
console.log('App patched.');
