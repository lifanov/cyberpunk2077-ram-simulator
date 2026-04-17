const fs = require('fs');

const appPath = 'src/App.tsx';
let data = fs.readFileSync(appPath, 'utf8');

if (!data.includes('timeSlowdown')) console.error('timeSlowdown missing');
if (!data.includes('autoCreateQueues')) console.error('autoCreateQueues missing');
if (!data.includes('activeDuration')) console.error('activeDuration missing');
if (!data.includes('networkHacksToApply')) console.error('networkHacksToApply missing');

console.log('App.tsx check complete');
