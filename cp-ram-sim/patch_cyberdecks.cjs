const fs = require('fs');
let data = fs.readFileSync('src/data/cyberdecks.ts', 'utf8');

if (!data.includes('canto-mk6')) {
  data = data.replace('];', `  ,{
    "id": "canto-mk6",
    "name": "Militech Canto Mk.6 (Unimplemented)",
    "maxRam": 10,
    "bonus": {}
  }
];`);
  fs.writeFileSync('src/data/cyberdecks.ts', data);
  console.log('Patched cyberdecks');
}
