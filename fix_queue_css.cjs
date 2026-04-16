const fs = require('fs');

const qsPath = 'cp-ram-sim/src/components/QueueSystem.tsx';
let qsData = fs.readFileSync(qsPath, 'utf8');

// The "Uploading" and "Active Effects" labels overlap the border. Let's fix that.
// <span className="text-xs text-sky-500 absolute -mt-4">Uploading</span>
qsData = qsData.replace('<span className="text-xs text-sky-500 absolute -mt-4">Uploading</span>', '<span className="text-xs text-sky-500 absolute -top-5 left-0">Uploading</span>');
qsData = qsData.replace('<span className="text-xs text-emerald-500 absolute -mt-4">Active Effects</span>', '<span className="text-xs text-emerald-500 absolute -top-5 left-0">Active Effects</span>');

qsData = qsData.replace('<div className="flex gap-2 min-w-max border-r border-sky-900 pr-4">', '<div className="flex gap-2 min-w-max border-r border-sky-900 pr-4 relative mt-4">');
qsData = qsData.replace('<div className="flex gap-2 min-w-max">', '<div className="flex gap-2 min-w-max relative mt-4">');

fs.writeFileSync(qsPath, qsData);
console.log('Fixed CSS labels');
