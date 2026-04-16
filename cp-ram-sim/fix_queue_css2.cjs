const fs = require('fs');

const qsPath = 'src/components/QueueSystem.tsx';
let qsData = fs.readFileSync(qsPath, 'utf8');

qsData = qsData.replace('<span className="text-xs text-sky-500 absolute -top-5 left-0">Uploading</span>', '<span className="text-xs text-sky-500 absolute -top-5 left-0 bg-slate-900 px-1">Uploading</span>');
qsData = qsData.replace('<span className="text-xs text-emerald-500 absolute -top-5 left-0">Active Effects</span>', '<span className="text-xs text-emerald-500 absolute -top-5 left-0 bg-slate-900 px-1">Active Effects</span>');

fs.writeFileSync(qsPath, qsData);
console.log('Fixed CSS labels overlap');
