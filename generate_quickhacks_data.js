const fs = require('fs');
const rawData = JSON.parse(fs.readFileSync('fandom_raw.json', 'utf8'));

const tierMap = {
    'TI': 1,
    'TII': 2,
    'TIII': 3,
    'TIV': 4,
    'TV': 5,
    'I': 'Iconic',
    'Iconic': 'Iconic'
};

const quickhacksParsed = [];

for (const name of Object.keys(rawData)) {
    const text = rawData[name];
    if (!text) continue;

    const infoboxMatch = text.match(/\{\{Infobox Quickhack([\s\S]*?)\}\}/);
    if (!infoboxMatch) {
        continue;
    }
    const infobox = infoboxMatch[1];

    let categoryMatch = infobox.match(/\|\s*type\s*=\s*(Covert|Combat|Control|Ultimate)/i);
    let category = categoryMatch ? categoryMatch[1] : 'Unknown';

    let uploadMatch = infobox.match(/\|\s*upload_time\s*=\s*(.+)/);
    let ramMatch = infobox.match(/\|\s*ram_cost\s*=\s*(.+)/);
    let qualityMatch = infobox.match(/\|\s*quality\s*=\s*\{\{R\|([^|}]+)/);

    const parseParam = (str) => {
        if (!str) return {};
        const res = {};

        const localRegex = /\{\{R\|([^|}]+)(?:\|[^|}]*)?(?:\|([0-9.]+))?\}\}|\{\{R\|([^|}]+)\|([0-9.]+)\}\}/g;

        let m;
        // The structure on the wiki is usually: {{R|TI|4}} or {{R|TII|5}} or {{R|I|Iconic|3}}
        // Let's use a simpler approach. Split by '{{R|'
        const parts = str.split('{{R|');
        for (let i = 1; i < parts.length; i++) {
            const p = parts[i].split('}}')[0]; // get inside the braces
            const pParts = p.split('|');
            const tierStr = pParts[0];
            let val = null;
            for (let j = 1; j < pParts.length; j++) {
                if (!isNaN(parseFloat(pParts[j]))) {
                    val = parseFloat(pParts[j]);
                }
            }
            if (val !== null && tierMap[tierStr]) {
                res[tierMap[tierStr]] = val;
            } else if (tierMap[tierStr] === 'Iconic' && val === null && pParts.length > 1) {
                // Handle odd iconic formatting
                for (let j = 1; j < pParts.length; j++) {
                    if (!isNaN(parseFloat(pParts[j]))) {
                        val = parseFloat(pParts[j]);
                    }
                }
                if (val !== null) res['Iconic'] = val;
            }
        }

        if (Object.keys(res).length === 0 && !str.includes('{{R|')) {
             const flatNum = parseFloat(str.trim());
             if (!isNaN(flatNum)) {
                 res['default'] = flatNum;
             }
        }

        return res;
    };

    let uploadTime = parseParam(uploadMatch ? uploadMatch[1] : '');
    let ramCost = parseParam(ramMatch ? ramMatch[1] : '');

    let startingTier = qualityMatch ? tierMap[qualityMatch[1]] : 1;
    if (typeof startingTier !== 'number') startingTier = 1;

    let availableTiers = [];
    const explicitlyStated = Object.keys(ramCost).map(x => x === 'Iconic' ? 6 : parseInt(x)).filter(x => !isNaN(x));
    const explicitlyStatedUpload = Object.keys(uploadTime).map(x => x === 'Iconic' ? 6 : parseInt(x)).filter(x => !isNaN(x));

    let allStated = [...explicitlyStated, ...explicitlyStatedUpload];
    let min = allStated.length > 0 ? Math.min(...allStated) : startingTier;
    if (min === 6) min = startingTier; // Iconic only? fall back

    // Ultimates start at Epic (T3)
    if (category === 'Ultimate') {
        min = Math.max(min, 3);
    }

    if (name === 'Blackwall Gateway') {
        availableTiers = ['Iconic']; // Blackwall Gateway is Iconic only
    } else {
        for (let i = min; i <= 5; i++) {
            availableTiers.push(i);
        }
        availableTiers.push('Iconic');
    }

    quickhacksParsed.push({
        name: name.replace(' (quickhack)', ''),
        category,
        availableTiers,
        ramCost,
        uploadTime,
        rawUploadTime: uploadMatch ? uploadMatch[1].trim() : '',
        rawRam: ramMatch ? ramMatch[1].trim() : ''
    });
}

fs.writeFileSync('parsed_hacks.json', JSON.stringify(quickhacksParsed, null, 2));
