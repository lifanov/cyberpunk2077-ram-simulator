const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('fandom_raw.json', 'utf8'));

const results = {};

function parseTable(wikitext, name) {
    const lines = wikitext.split('\n');
    let currentTier = '';
    let parsedStats = {};

    // Some quickhacks have specific tier templates or tables. We need to extract: Tier, Upload Time, RAM Cost.
    // MediaWiki tables for quickhacks often use {{Cyberpunk 2077 Item| ... | cost = 4 | duration = 5 | upload_time = 1 | ... }}
    // Or they list them out in a wikitext table. Let's try to extract {{Item Infobox}} or {{Cyberpunk 2077 Item}} or table rows.

    // Using regex to find templates like {{Item Infobox ... | upload_time = 1.5 ... }}
    let inTable = false;
    let currentRow = {};

    for (const line of lines) {
        if (line.includes('{{Item Infobox') || line.includes('{{Cyberpunk 2077 Quickhack')) {
            // Some specific parsing if needed, but it's often a table.
        }
    }

    // A robust regex to find RAM cost, Tier, Upload Time across the wikitext:
    // It's often formatted as `| tier = 2 | cost = 3 | upload_time = 1.5`
    // Let's just dump the raw wikitext for "Ping" to see the structure.
}

console.log("Wikitext snippet for Ping:");
console.log(rawData["Ping"].substring(0, 1500));
console.log("-------------");
console.log("Wikitext snippet for Contagion:");
console.log(rawData["Contagion"].substring(0, 1500));
