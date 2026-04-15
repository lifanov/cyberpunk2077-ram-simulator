const fs = require('fs');

let typesFile = fs.readFileSync('src/types.ts', 'utf8');
typesFile = typesFile.replace('queueMastery: boolean; // 4th slot half cost',
`queueMastery: boolean; // 4th slot half cost
  queueAcceleration: boolean; // +60% upload speed for 3rd or later in queue
  queuePrioritization: boolean; // +50% upload speed for 1st if at least 2 queued`);
fs.writeFileSync('src/types.ts', typesFile);

let appFile = fs.readFileSync('src/App.tsx', 'utf8');
appFile = appFile.replace('queueMastery: false,', `queueMastery: false,
    queueAcceleration: false,
    queuePrioritization: false,`);

appFile = appFile.replace('</label>\n        </div>\n      </div>',
`  <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-sky-800 bg-slate-900 checked:bg-sky-500"
                checked={perks.queueAcceleration} onChange={e => setPerks({...perks, queueAcceleration: e.target.checked})} />
              <span className="group-hover:text-sky-300">Queue Acceleration (+60% speed 3rd+)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-sky-800 bg-slate-900 checked:bg-sky-500"
                checked={perks.queuePrioritization} onChange={e => setPerks({...perks, queuePrioritization: e.target.checked})} />
              <span className="group-hover:text-sky-300">Queue Prioritization (+50% speed 1st if 2+ queued)</span>
            </label>
          </label>
        </div>
      </div>`);

// wait, the appFile.replace string was bad
// Let's just find "Queue Mastery" and append after it.

const lines = appFile.split('\n');
const qmIdx = lines.findIndex(l => l.includes('Queue Mastery'));
if (qmIdx !== -1) {
    const nextLabelIdx = lines.findIndex((l, i) => i > qmIdx && l.includes('</label>'));
    if (nextLabelIdx !== -1) {
        lines.splice(nextLabelIdx + 1, 0, `            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-sky-800 bg-slate-900 checked:bg-sky-500"
                checked={perks.queueAcceleration} onChange={e => setPerks({...perks, queueAcceleration: e.target.checked})} />
              <span className="group-hover:text-sky-300">Queue-Acceleration (+60% speed 3rd+)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-sky-800 bg-slate-900 checked:bg-sky-500"
                checked={perks.queuePrioritization} onChange={e => setPerks({...perks, queuePrioritization: e.target.checked})} />
              <span className="group-hover:text-sky-300">Queue Prioritization (+50% speed 1st if 2+ queued)</span>
            </label>`);
    }
}
fs.writeFileSync('src/App.tsx', lines.join('\n'));
