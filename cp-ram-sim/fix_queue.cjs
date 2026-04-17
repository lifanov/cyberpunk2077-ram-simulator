const fs = require('fs');

const qsPath = 'src/components/QueueSystem.tsx';
let qsData = fs.readFileSync(qsPath, 'utf8');

// The Queue UI needs to visually separate "uploading" slots from "active" effects.
// Currently it renders [0, 1, 2, 3] from q.items.
// But q.items now contains both uploading and completed items because we keep completed items for duration.

const replaceRegex = /<div className="flex flex-1 gap-2 border-l border-sky-800 pl-4">[\s\S]*?<\/div>\s*\{q\.locked/;

const replacement = `<div className="flex flex-1 gap-2 border-l border-sky-800 pl-4 overflow-x-auto">
              <div className="flex gap-2 min-w-max border-r border-sky-900 pr-4">
                <span className="text-xs text-sky-500 absolute -mt-4">Uploading</span>
                {[0, 1, 2, 3].map(slotIndex => {
                  const uploadingItems = q.items.filter(it => !it.completed);
                  const item = uploadingItems[slotIndex];
                  if (!item) {
                    return <div key={slotIndex} className="w-16 h-16 shrink-0 border border-dashed border-sky-900 rounded bg-slate-900 flex items-center justify-center text-sky-900 text-xs">Empty</div>;
                  }
                  const progress = item.completed ? 100 : Math.max(0, 100 - (item.remainingUploadTime / item.quickhack.uploadTime) * 100);
                  return (
                    <div key={item.id} className="w-16 h-16 shrink-0 border border-sky-600 rounded relative overflow-hidden bg-slate-800 flex flex-col items-center justify-center p-1">
                      <div className="absolute top-0 left-0 h-full bg-cyan-700/50 z-0 transition-all duration-100 ease-linear" style={{ width: \`\${progress}%\` }}></div>
                      <span className="relative z-10 text-[10px] font-bold text-sky-200 text-center leading-tight">{item.quickhack.name}</span>
                      <span className="relative z-10 text-[9px] text-yellow-500">T{item.quickhack.tier} • {item.cost}R</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 min-w-max">
                <span className="text-xs text-emerald-500 absolute -mt-4">Active Effects</span>
                {q.items.filter(it => it.completed && it.activeDuration > 0).map(item => {
                  const progress = Math.max(0, (item.activeDuration / item.quickhack.duration) * 100);
                  return (
                    <div key={item.id} className="w-16 h-16 shrink-0 border border-emerald-600 rounded relative overflow-hidden bg-slate-800 flex flex-col items-center justify-center p-1 opacity-80">
                      <div className="absolute top-0 left-0 h-full bg-emerald-900/50 z-0 transition-all duration-100 ease-linear" style={{ width: \`\${progress}%\` }}></div>
                      <span className="relative z-10 text-[10px] font-bold text-emerald-200 text-center leading-tight">{item.quickhack.name}</span>
                      <span className="relative z-10 text-[9px] text-emerald-400">{item.activeDuration.toFixed(1)}s</span>
                    </div>
                  );
                })}
                {q.items.filter(it => it.completed && it.activeDuration > 0).length === 0 && (
                   <div className="text-xs text-slate-600 flex items-center px-2">No active effects</div>
                )}
              </div>
            </div>
            {q.locked`;

qsData = qsData.replace(replaceRegex, replacement);

fs.writeFileSync(qsPath, qsData);
console.log('Fixed QueueSystem.tsx');
