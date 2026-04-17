const fs = require('fs');

const qsPath = 'src/components/QueueSystem.tsx';
let qsData = fs.readFileSync(qsPath, 'utf8');

// Also update the queue length check for cost calculation to only check uncompleted items.
// const isFourthSlot = queue.items.length === 3;
qsData = qsData.replace(
  'const isFourthSlot = queue.items.length === 3;',
  'const isFourthSlot = queue.items.filter(it => !it.completed).length === 3;'
);

qsData = qsData.replace(
  'locked: newItems.length >= 4,',
  'locked: newItems.filter(it => !it.completed).length >= 4,'
);

// Add disabled class for Canto and Blackwall
const renderHack = `          {cyberdeck.map((hack, idx) => {
            if (!hack) {
              return <div key={idx} className="h-20 border border-slate-700 rounded bg-slate-900 flex items-center justify-center text-slate-700">Empty</div>;
            }

            const activeQueue = queues.find(q => q.id === activeQueueId);
            const isFourthSlot = activeQueue ? activeQueue.items.filter(it => !it.completed).length === 3 : false;
            const currentCost = calculateCost(hack, isFourthSlot);
            const canAfford = currentRAM >= currentCost;

            const isUnimplemented = hack.name === 'Blackwall Gateway';

            return (
              <button
                key={idx}
                onClick={() => handleAddHackToQueue(hack)}
                disabled={!canAfford || (activeQueue && activeQueue.locked) || isUnimplemented}
                className={\`h-20 flex flex-col items-center justify-center p-2 rounded transition-colors \${
                  isUnimplemented ? 'bg-red-900/10 border-red-900/50 text-slate-600 cursor-not-allowed' :
                  !canAfford ? 'bg-red-900/20 border-red-900 text-slate-500 cursor-not-allowed' :
                  'bg-sky-900/40 border border-sky-600 hover:bg-sky-800 cursor-pointer'
                }\`}
              >
                <span className="font-bold text-sm text-sky-200 leading-tight">{hack.name} <span className="text-xs text-yellow-500">T{hack.tier}</span></span>
                <span className={\`text-xs mt-1 \${isUnimplemented ? 'text-red-500' : isFourthSlot && perks.queueMastery ? 'text-green-400 font-bold' : 'text-sky-400'}\`}>
                  {isUnimplemented ? 'UNIMPLEMENTED' : \`Cost: \${currentCost} RAM\`}
                </span>
              </button>
            )
          })}`;

qsData = qsData.replace(/\{cyberdeck\.map\(\(hack, idx\) => \{[\s\S]*?\}\)\}/, renderHack);

fs.writeFileSync(qsPath, qsData);
console.log('Patched queue');
