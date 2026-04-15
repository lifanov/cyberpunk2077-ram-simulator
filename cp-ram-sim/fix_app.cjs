const fs = require('fs');

let appFile = fs.readFileSync('src/App.tsx', 'utf8');

// I replaced too much. I need to make sure the loop calculates the tick properly
appFile = appFile.replace(`const activeDeck = CYBERDECKS.find(d => d.id === inputs.selectedCyberdeckId);

        let uploadSpeedMultiplier = 1 + (inputs.uploadReduction / 100);
        // Instead of modifying upload time globally here, cyberdeck modifiers are usually specific to quickhack types.
        // Wait, netwatch reduces *time*, not increases *speed* for combat hacks.
        // If the hack is combat and netwatch is selected, time remaining reduces faster, or total time is halved when added.
        // Since time is tracked per item, reducing time remaining when added is better, or applying it during the tick.

        const timeToSubtract = (tickRateMs / 1000) * uploadSpeedMultiplier;`,
`const uploadSpeedMultiplier = 1 + (inputs.uploadReduction / 100);
        const timeToSubtract = (tickRateMs / 1000) * uploadSpeedMultiplier;`);

fs.writeFileSync('src/App.tsx', appFile);
