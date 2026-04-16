const fs = require('fs');

const appPath = 'src/App.tsx';
let data = fs.readFileSync(appPath, 'utf8');

// 1. Add inputs to settings UI
const settingsReplacement = `          <label className="flex justify-between items-center">
            <span>Upload Speed Factor (% faster):</span>
            <input type="number" className="w-20 bg-slate-800 border border-sky-700 text-sky-300 p-1" value={inputs.uploadReduction} onChange={e => setInputs({...inputs, uploadReduction: Number(e.target.value)})} />
          </label>
          <label className="flex justify-between items-center text-amber-300">
            <span>Time Slowdown (%):</span>
            <input type="range" min="0" max="100" className="w-32 accent-amber-500" value={inputs.timeSlowdown} onChange={e => setInputs({...inputs, timeSlowdown: Number(e.target.value)})} />
            <span className="w-10 text-right">{inputs.timeSlowdown}%</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer mt-2 text-sky-300">
            <input type="checkbox" checked={inputs.autoCreateQueues} onChange={e => setInputs({...inputs, autoCreateQueues: e.target.checked})} className="accent-sky-500" />
            Auto-create Queues on Lock/Kill
          </label>`;

data = data.replace(
  /<label className="flex justify-between items-center">\s*<span>Upload Speed Factor[^<]+<\/span>\s*<input[^>]+value={inputs\.uploadReduction}[^>]+>\s*<\/label>/m,
  settingsReplacement
);

// 2. Modify Simulation Loop for slow down
const regenReplacement = `      // 1. Regenerate RAM
      const timeScalar = 1 - (inputs.timeSlowdown / 100);
      if (timeScalar <= 0) return; // Completely paused

      setCurrentRAM(prev => {
        let baseRegen = inputs.regenRate;
        if (perks.optimization) {
          baseRegen += inputs.regenRate * 0.1;
        }
        const regenAmount = baseRegen * (tickRateMs / 1000) * timeScalar;
        return Math.min(inputs.maxRam, prev + regenAmount);
      });`;

data = data.replace(
  /\/\/ 1\. Regenerate RAM[\s\S]*?return Math\.min\(inputs\.maxRam, prev \+ regenAmount\);\n\s*}\);/,
  regenReplacement
);

fs.writeFileSync(appPath, data);
