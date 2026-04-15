const fs = require('fs');
let deckFile = fs.readFileSync('src/components/Cyberdeck.tsx', 'utf8');

// Look for alert logic
console.log(deckFile.includes('alert(`You already have a tier of ${hack.name} equipped.`)'));

deckFile = deckFile.replace(`      if (hack) {
        const exists = cyberdeck.some((h, i) => i !== index && h && h.name === hack.name);
        if (exists) {
          alert(\`You already have a tier of \${hack.name} equipped.\`);
          return;
        }
        const newDeck = [...cyberdeck];
        newDeck[index] = hack;
        setCyberdeck(newDeck);
      }
    }`, `      if (hack) {
        const exists = cyberdeck.some((h, i) => i !== index && h && h.name === hack.name);
        if (exists) {
          alert(\`You already have a tier of \${hack.name} equipped.\`);
        } else {
          const newDeck = [...cyberdeck];
          newDeck[index] = hack;
          setCyberdeck(newDeck);
        }
      }
    }`);

fs.writeFileSync('src/components/Cyberdeck.tsx', deckFile);
console.log('fixed alert return flow inside handleDragEnd');
