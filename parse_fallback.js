// Since the wiki uses shorthand like: `{{R|TI|2}} → {{R|TII|3}} → {{R|TIV|4}} → {{R|I|3}}`
// This means Tier 1 is 2, Tier 2 is 3, Tier 3 inherits Tier 2 (3), Tier 4 is 4, Tier 5 inherits Tier 4 (4), Iconic is 3.

const fs = require('fs');
const parsedHacks = JSON.parse(fs.readFileSync('parsed_hacks.json', 'utf8'));

const tierOrder = [1, 2, 3, 4, 5, 'Iconic'];

for (const hack of parsedHacks) {
    // Fill in missing RAM costs and Upload Times by propagating forward
    let lastRam = null;
    let lastUpload = null;

    // For ultimates we might not have lower tiers
    const minTier = hack.availableTiers[0];

    // Check if there are default values
    if (hack.ramCost['default'] !== undefined) {
        lastRam = hack.ramCost['default'];
    }
    if (hack.uploadTime['default'] !== undefined) {
        lastUpload = hack.uploadTime['default'];
    }

    // The wiki often lists an iconic upload time that might be different, but if it's not listed, it inherits from T5
    for (const tier of tierOrder) {
        if (!hack.availableTiers.includes(tier)) continue;

        if (hack.ramCost[tier] !== undefined) {
            lastRam = hack.ramCost[tier];
        } else if (lastRam !== null) {
            hack.ramCost[tier] = lastRam;
        }

        if (hack.uploadTime[tier] !== undefined) {
            lastUpload = hack.uploadTime[tier];
        } else if (lastUpload !== null) {
            hack.uploadTime[tier] = lastUpload;
        }
    }

    // some quickhacks don't have *any* upload time parsed if it was flat text (like "1.0"). Let's check `rawUploadTime`.
    if (Object.keys(hack.uploadTime).length === 0) {
        const flatNum = parseFloat(hack.rawUploadTime.replace(/[^\d.]/g, ''));
        if (!isNaN(flatNum)) {
             for (const tier of hack.availableTiers) {
                 hack.uploadTime[tier] = flatNum;
             }
        }
    }
}

fs.writeFileSync('parsed_hacks_final.json', JSON.stringify(parsedHacks, null, 2));
console.log('Saved to parsed_hacks_final.json');
