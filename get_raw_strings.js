const fs = require('fs');
const rawData = JSON.parse(fs.readFileSync('fandom_raw.json', 'utf8'));

for (const name of Object.keys(rawData)) {
    const text = rawData[name];
    if (!text) continue;

    const infoboxMatch = text.match(/\{\{Infobox Quickhack([\s\S]*?)\}\}/);
    if (!infoboxMatch) {
        continue;
    }
    const infobox = infoboxMatch[1];

    let uploadMatch = infobox.match(/\|\s*upload_time\s*=\s*(.+)/);
    let ramMatch = infobox.match(/\|\s*ram_cost\s*=\s*(.+)/);

    console.log(name);
    console.log(" RAM: " + (ramMatch ? ramMatch[1] : ''));
    console.log(" UPL: " + (uploadMatch ? uploadMatch[1] : ''));
}
