const fs = require('fs');

let appFile = fs.readFileSync('src/App.tsx', 'utf8');

appFile = appFile.replace(`onChange={(e) => {
                 setInputs(prev => ({...prev, selectedCyberdeckId: e.target.value}));
                 const deck = CYBERDECKS.find(d => d.id === e.target.value);
                 if (deck && deck.maxRam !== prev.maxRam) {
                     // Optionally update max RAM when deck changes
                     // We will let user manually override maxRam, but let's set it to deck's maxRam if changed
                     setInputs(p => ({...p, maxRam: deck.maxRam, selectedCyberdeckId: e.target.value}));
                 }
              }}`,
`onChange={(e) => {
                 const deckId = e.target.value;
                 const deck = CYBERDECKS.find(d => d.id === deckId);
                 setInputs(prev => ({
                   ...prev,
                   selectedCyberdeckId: deckId,
                   maxRam: deck ? deck.maxRam : prev.maxRam
                 }));
              }}`);

fs.writeFileSync('src/App.tsx', appFile);
console.log('fixed dropdown state logic');
