const fs = require('fs');

const appPath = 'cp-ram-sim/src/App.tsx';
let appData = fs.readFileSync(appPath, 'utf8');

appData = appData.replace(
  "selectedCyberdeckId: 'none',",
  "selectedCyberdeckId: 'none',\n    timeSlowdown: 0,\n    autoCreateQueues: false,"
);

fs.writeFileSync(appPath, appData);

const qsPath = 'cp-ram-sim/src/components/QueueSystem.tsx';
let qsData = fs.readFileSync(qsPath, 'utf8');

qsData = qsData.replace(
  'completed: false,',
  'completed: false,\n      activeDuration: hack.duration,'
);

fs.writeFileSync(qsPath, qsData);
console.log('Fixed initial state');
