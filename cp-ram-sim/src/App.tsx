import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { InputState, PerkState, HackQueue, Quickhack } from './types';
import { Cyberdeck } from './components/Cyberdeck';
import { QueueSystem } from './components/QueueSystem';
import './index.css';

function App() {
  const [inputs, setInputs] = useState<InputState>({
    maxRam: 20,
    regenRate: 1.0,
    ramOnKill: 2,
    uploadReduction: 0,
  });

  const [perks, setPerks] = useState<PerkState>({
    optimization: false,
    dataRecycler: false,
    speculation: false,
    queueMastery: false,
  });

  const [currentRAM, setCurrentRAM] = useState<number>(20);
  const [cyberdeck, setCyberdeck] = useState<(Quickhack | null)[]>(Array(8).fill(null));
  const [queues, setQueues] = useState<HackQueue[]>([]);
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);

  // Simulation Loop
  useEffect(() => {
    const tickRateMs = 50; // 50ms per tick
    const interval = setInterval(() => {
      // 1. Regenerate RAM
      setCurrentRAM(prev => {
        let baseRegen = inputs.regenRate;
        if (perks.optimization) {
          baseRegen += inputs.regenRate * 0.1;
        }
        const regenAmount = baseRegen * (tickRateMs / 1000);
        return Math.min(inputs.maxRam, prev + regenAmount);
      });

      // 2. Process Queues and handle Kills/Drains
      setQueues(prevQueues => {
        if (prevQueues.length === 0) return prevQueues;

        const uploadSpeedMultiplier = 1 + (inputs.uploadReduction / 100);
        const timeToSubtract = (tickRateMs / 1000) * uploadSpeedMultiplier;

        let queuesChanged = false;
        let ramToRefund = 0;

        const nextQueues = prevQueues.map(queue => {
          if (queue.items.length === 0) return queue;

          const newItems = [...queue.items];
          // Find the first uncompleted item
          const activeItemIndex = newItems.findIndex(item => !item.completed);

          // Check if queue just finished everything naturally (Drain)
          if (activeItemIndex === -1) {
            // Already completely finished, just clear it
            return null;
          }

          const item = newItems[activeItemIndex];
          const newRemainingTime = Math.max(0, item.remainingUploadTime - timeToSubtract);

          if (newRemainingTime !== item.remainingUploadTime) {
            queuesChanged = true;
            newItems[activeItemIndex] = {
              ...item,
              remainingUploadTime: newRemainingTime,
              completed: newRemainingTime === 0
            };
          }

          // Check if the current item just completed right now
          if (newRemainingTime === 0 && item.remainingUploadTime > 0) {
            const h = item.quickhack;
            let triggersKill = false;

            // Kill Condition 1: Ultimate quickhack
            if (h.category === 'Ultimate') triggersKill = true;
            // Kill Condition 2: Synapse Burnout
            if (h.name === 'Synapse Burnout') triggersKill = true;
            // Kill Condition 3: Short Circuit
            if (h.name === 'Short Circuit') triggersKill = true;

            // Gather previously completed hacks in this queue
            const prevHacks = newItems.slice(0, activeItemIndex).map(i => i.quickhack.name);

            // Kill Condition 4: Overheat following Contagion
            if (h.name === 'Overheat' && prevHacks.includes('Contagion')) triggersKill = true;

            // Kill Condition 5: Sonic Shock following Memory Wipe + Reboot Optics
            if (h.name === 'Sonic Shock' && prevHacks.includes('Memory Wipe') && prevHacks.includes('Reboot Optics')) triggersKill = true;

            if (triggersKill) {
              console.log("KILL TRIGGERED by", h.name);
              // Calculate refunds
              let refund = inputs.ramOnKill;

              const totalQueueCost = newItems.reduce((sum, it) => sum + it.cost, 0);

              if (perks.speculation) {
                refund += totalQueueCost * 0.25;
              }

              if (perks.dataRecycler) {
                const unexecutedCost = newItems.slice(activeItemIndex + 1).reduce((sum, it) => sum + it.cost, 0);
                refund += unexecutedCost * 0.8;
              }

              ramToRefund += refund;

              // Destroy queue on kill
              return null;
            }
          }

          // If it reached the end normally without kill, and we just completed the last one
          if (activeItemIndex === newItems.length - 1 && newItems[activeItemIndex].completed) {
            return null; // Drain/Clear
          }

          if (queuesChanged) {
            return { ...queue, items: newItems };
          }
          return queue;
        }).filter(q => q !== null) as HackQueue[]; // remove nulls

        // Apply any pending refunds
        if (ramToRefund > 0) {
          setCurrentRAM(prev => Math.min(inputs.maxRam, prev + ramToRefund));
        }

        // If no queues remain after processing, instantly create an empty one
        if (nextQueues.length === 0 && prevQueues.length > 0) {
           const emptyQueue: HackQueue = { id: uuidv4(), items: [], locked: false };
           setActiveQueueId(emptyQueue.id);
           return [emptyQueue];
        }

        return queuesChanged || nextQueues.length !== prevQueues.length ? nextQueues : prevQueues;
      });

    }, tickRateMs);

    return () => clearInterval(interval);
  }, [inputs.maxRam, inputs.regenRate, inputs.uploadReduction, inputs.ramOnKill, perks]);

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8">
      <header className="text-3xl font-bold text-center border-b border-sky-500 pb-4">
        Cyberpunk 2077 RAM Simulator
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-4 border border-sky-800 p-4 rounded bg-slate-900">
          <h2 className="text-xl font-bold text-sky-400">Settings</h2>

          <label className="flex justify-between items-center">
            <span>Max RAM:</span>
            <input type="number" className="w-20 bg-slate-800 border border-sky-700 text-sky-300 p-1" value={inputs.maxRam} onChange={e => setInputs({...inputs, maxRam: Number(e.target.value)})} />
          </label>
          <label className="flex justify-between items-center">
            <span>RAM Regen Rate (/s):</span>
            <input type="number" step="0.1" className="w-20 bg-slate-800 border border-sky-700 text-sky-300 p-1" value={inputs.regenRate} onChange={e => setInputs({...inputs, regenRate: Number(e.target.value)})} />
          </label>
          <label className="flex justify-between items-center">
            <span>RAM on Kill:</span>
            <input type="number" className="w-20 bg-slate-800 border border-sky-700 text-sky-300 p-1" value={inputs.ramOnKill} onChange={e => setInputs({...inputs, ramOnKill: Number(e.target.value)})} />
          </label>
          <label className="flex justify-between items-center">
            <span>Upload Speed Factor (% faster):</span>
            <input type="number" className="w-20 bg-slate-800 border border-sky-700 text-sky-300 p-1" value={inputs.uploadReduction} onChange={e => setInputs({...inputs, uploadReduction: Number(e.target.value)})} />
          </label>

          <h2 className="text-xl font-bold text-sky-400 mt-4 border-t border-sky-800 pt-4">Perks</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={perks.optimization} onChange={e => setPerks({...perks, optimization: e.target.checked})} className="accent-sky-500" />
            Optimization (+10% RAM Regen)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={perks.dataRecycler} onChange={e => setPerks({...perks, dataRecycler: e.target.checked})} className="accent-sky-500" />
            Data Recycler (Refund 80% unexecuted)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={perks.speculation} onChange={e => setPerks({...perks, speculation: e.target.checked})} className="accent-sky-500" />
            Speculation (Refund 25% queue cost)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={perks.queueMastery} onChange={e => setPerks({...perks, queueMastery: e.target.checked})} className="accent-sky-500" />
            Queue Mastery (4th slot half cost)
          </label>
        </div>

        <div className="col-span-2 flex flex-col gap-4 border border-sky-800 p-4 rounded bg-slate-900">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-sky-400">Current RAM</h2>
            <div className="text-3xl font-mono text-cyan-400">{Math.floor(currentRAM)} / {inputs.maxRam}</div>
          </div>
          <div className="w-full bg-slate-800 h-6 rounded overflow-hidden border border-sky-900 relative mb-4">
            <div className="h-full bg-cyan-600 transition-all duration-100 ease-linear" style={{ width: `${Math.min(100, Math.max(0, (currentRAM / inputs.maxRam) * 100))}%` }}></div>
          </div>

          <Cyberdeck cyberdeck={cyberdeck} setCyberdeck={setCyberdeck} />

          <QueueSystem
            queues={queues}
            setQueues={setQueues}
            activeQueueId={activeQueueId}
            setActiveQueueId={setActiveQueueId}
            cyberdeck={cyberdeck}
            currentRAM={currentRAM}
            setCurrentRAM={setCurrentRAM}
            perks={perks}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
