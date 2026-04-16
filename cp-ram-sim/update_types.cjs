const fs = require('fs');

const typesPath = 'src/types.ts';
let typesData = fs.readFileSync(typesPath, 'utf8');

// We need to add activeDuration to QueueItem
typesData = typesData.replace(
  'completed: boolean;',
  'completed: boolean;\n  activeDuration: number; // Duration remaining after upload'
);

// We need to add timeSlowdown and autoCreateQueues to InputState
typesData = typesData.replace(
  'selectedCyberdeckId: string;',
  'selectedCyberdeckId: string;\n  timeSlowdown: number; // 0 to 100 percentage\n  autoCreateQueues: boolean;'
);

fs.writeFileSync(typesPath, typesData);
console.log('Updated types.ts');
