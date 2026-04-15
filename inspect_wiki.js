const fs = require('fs');
const rawData = JSON.parse(fs.readFileSync('fandom_raw.json', 'utf8'));

console.log(rawData['Ping'].substring(0, 2000));
