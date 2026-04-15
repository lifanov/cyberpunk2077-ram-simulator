const fs = require('fs');
let queueFile = fs.readFileSync('src/components/QueueSystem.tsx', 'utf8');

queueFile = queueFile.replace(`    if (isFourthSlot && perks.queueMastery) {
      return Math.max(1, Math.floor(cost / 2));
    }
    return cost;

      return Math.max(1, Math.floor(hack.baseCost / 2));
    }

  };`, `    if (isFourthSlot && perks.queueMastery) {
      return Math.max(1, Math.floor(cost / 2));
    }
    return cost;
  };`);

queueFile = queueFile.replace(`    const newItem: QueueItem = {
      id: uuidv4(),
      quickhack: hack,
      remainingUploadTime: hack.uploadTime,`, `
    let uploadTime = hack.uploadTime;
    const activeDeck = CYBERDECKS.find(d => d.id === inputs.selectedCyberdeckId);
    if (activeDeck && activeDeck.bonus.combatUploadReduction && hack.category === 'Combat') {
        uploadTime = uploadTime * (1 - activeDeck.bonus.combatUploadReduction);
    }

    const newItem: QueueItem = {
      id: uuidv4(),
      quickhack: hack,
      remainingUploadTime: uploadTime,`);

fs.writeFileSync('src/components/QueueSystem.tsx', queueFile);
console.log('patched QueueSystem');
