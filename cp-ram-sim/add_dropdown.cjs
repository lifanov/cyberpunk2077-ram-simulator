const fs = require('fs');

const appPath = 'src/App.tsx';
let data = fs.readFileSync(appPath, 'utf8');

const settingsReplacement = `<label className="flex justify-between items-center">
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

if (!data.includes('Time Slowdown')) {
    const searchString = '<label className="flex justify-between items-center">\n            <span>Upload Speed Factor (% faster):</span>\n            <input type="number" className="w-20 bg-slate-800 border border-sky-700 text-sky-300 p-1" value={inputs.uploadReduction} onChange={e => setInputs({...inputs, uploadReduction: Number(e.target.value)})} />\n          </label>';
    data = data.replace(searchString, settingsReplacement);
    fs.writeFileSync(appPath, data);
    console.log('Added UI controls');
}
