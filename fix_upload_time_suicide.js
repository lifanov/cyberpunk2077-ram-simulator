const fs = require('fs');
const parsedHacks = JSON.parse(fs.readFileSync('parsed_hacks_final.json', 'utf8'));

// Suicide missing some early upload times because the fallback didn't catch if it was undefined before Iconic
const hack = parsedHacks.find(h => h.name === 'Suicide');
if (hack) {
    hack.uploadTime = {
        "4": 12.5,
        "5": 12.5,
        "Iconic": 12.5
    };
}
// Blackwall Gateway
const bg = parsedHacks.find(h => h.name === 'Blackwall Gateway');
if (bg) {
    bg.ramCost = { "Iconic": 14 };
    bg.uploadTime = { "Iconic": 9 };
}

fs.writeFileSync('parsed_hacks_final.json', JSON.stringify(parsedHacks, null, 2));
