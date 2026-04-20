import { useState, useEffect, useRef } from 'react';

import type { InputState, PerkState, HackQueue, Quickhack, QueueItem } from './types';
import { CYBERDECKS } from './data/cyberdecks';
import { Cyberdeck } from './components/Cyberdeck';
import { QueueSystem } from './components/QueueSystem';
import './index.css';

function App() {
  const [inputs, setInputs] = useState<InputState>({
    maxRam: 20,
    regenRate: 1.0,
    ramOnKill: 2,
    uploadReduction: 0,
    selectedCyberdeckId: 'none',
    timeSlowdown: 0,
    autoCreateQueues: false,
    cyberware: 'none',
    intelligence: 20,
  });

  const [cyberwareCooldownRemaining, setCyberwareCooldownRemaining] = useState<number>(0);

  const [perks, setPerks] = useState<PerkState>({
    optimization: false,
    dataRecycler: false,
    speculation: false,
    queueMastery: false,
    queueAcceleration: false,
    queuePrioritization: false,
  });

  const [currentRAM, setCurrentRAM] = useState<number>(20);
  const [cyberdeck, setCyberdeck] = useState<(Quickhack | null)[]>(Array(8).fill(null));
  const [queues, setQueues] = useState<HackQueue[]>([]);
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);

  const ramRef = useRef(currentRAM);
  const cdRef = useRef(cyberwareCooldownRemaining);

  useEffect(() => {
    ramRef.current = currentRAM;
  }, [currentRAM]);

  useEffect(() => {
    cdRef.current = cyberwareCooldownRemaining;
  }, [cyberwareCooldownRemaining]);

  // Simulation Loop
  useEffect(() => {
    const tickRateMs = 50; // 50ms per tick
    const interval = setInterval(() => {
      const timeScalar = 1 - (inputs.timeSlowdown / 100);
      if (timeScalar <= 0) return; // Completely paused

      // Cyberware check uses refs to avoid closures and interval resetting
      let triggerHealAmount = 0;
      let newCooldownVal = Math.max(0, cdRef.current - (tickRateMs / 1000) * timeScalar);

      if (inputs.cyberware !== 'none' && newCooldownVal === 0) {
        const threshold = inputs.maxRam * 0.20;
        if (ramRef.current <= threshold) {
          if (inputs.cyberware === 'reallocator') {
            triggerHealAmount = inputs.maxRam * 0.45;
            if (ramRef.current < inputs.maxRam * 0.10) {
              newCooldownVal = Math.max(0, 85 - (inputs.intelligence * 3));
            }
          } else if (inputs.cyberware === 'camillo') {
            triggerHealAmount = inputs.maxRam * 0.23;
            if (ramRef.current < inputs.maxRam * 0.10) {
              newCooldownVal = Math.max(0, 80 - (inputs.intelligence * 2));
            }
          }
        }
      }

      // 0. Update Cooldowns (only if it actually changed to avoid unnecessary renders)
      if (newCooldownVal !== cdRef.current) {
         setCyberwareCooldownRemaining(newCooldownVal);
      }

      // 1. Regenerate RAM
      setCurrentRAM(prevRAM => {
        const nextRAM = prevRAM + triggerHealAmount;

        let baseRegen = inputs.regenRate;
        if (perks.optimization) {
          baseRegen += inputs.regenRate * 0.1;
        }
        const regenAmount = baseRegen * (tickRateMs / 1000) * timeScalar;
        return Math.min(inputs.maxRam, nextRAM + regenAmount);
      });

      // 2. Process Queues and handle Kills/Drains
      setQueues(prevQueues => {
        if (prevQueues.length === 0) return prevQueues;

        const uploadSpeedMultiplier = 1 + (inputs.uploadReduction / 100);
        let queuesChanged = false;
        let ramToRefund = 0;
        const networkHacksToApply: QueueItem[] = []; // for ping/memory wipe
        const contagionSpreadQueue: {item: QueueItem, sourceQueueId: string}[] = [];

        let nextQueues = prevQueues.map(queue => {
          if (queue.items.length === 0) return queue;

          const newItems = [...queue.items];
          let queueModified = false;

          // Process active durations first
          for (let i = 0; i < newItems.length; i++) {
            if (newItems[i].completed && newItems[i].activeDuration > 0) {
              const newDuration = Math.max(0, newItems[i].activeDuration - (tickRateMs / 1000) * timeScalar);
              if (newDuration !== newItems[i].activeDuration) {
                newItems[i] = { ...newItems[i], activeDuration: newDuration };
                queueModified = true;
              }
            }
          }

          // Remove items that have completely expired
          const itemsBeforeFilter = newItems.length;
          const filteredItems = newItems.filter(item => !item.completed || item.activeDuration > 0);
          if (filteredItems.length !== itemsBeforeFilter) queueModified = true;

          const activeItemIndex = filteredItems.findIndex(item => !item.completed);

          if (activeItemIndex !== -1) {
            // Process upload
            let currentUploadSpeedMultiplier = uploadSpeedMultiplier;
            if (perks.queuePrioritization && activeItemIndex === 0 && filteredItems.length >= 2) {
                currentUploadSpeedMultiplier += 0.5;
            }
            if (perks.queueAcceleration && activeItemIndex >= 2) {
                currentUploadSpeedMultiplier += 0.6;
            }

            const localTimeToSubtract = (tickRateMs / 1000) * currentUploadSpeedMultiplier * timeScalar;
            const item = filteredItems[activeItemIndex];
            const newRemainingTime = Math.max(0, item.remainingUploadTime - localTimeToSubtract);

            if (newRemainingTime !== item.remainingUploadTime) {
              queueModified = true;
              filteredItems[activeItemIndex] = {
                ...item,
                remainingUploadTime: newRemainingTime,
                completed: newRemainingTime === 0
              };
            }

            // If it just completed
            if (newRemainingTime === 0 && item.remainingUploadTime > 0) {
              const h = item.quickhack;
              let triggersKill = false;

              if (h.category === 'Ultimate' || h.name === 'Synapse Burnout' || h.name === 'Short Circuit') triggersKill = true;

              const prevHacks = filteredItems.slice(0, activeItemIndex).map(i => i.quickhack.name);
              if (h.name === 'Overheat' && prevHacks.includes('Contagion')) triggersKill = true;
              if (h.name === 'Sonic Shock' && prevHacks.includes('Memory Wipe') && prevHacks.includes('Reboot Optics')) triggersKill = true;

              if (triggersKill) {
                console.log("KILL TRIGGERED by", h.name);
                let refund = inputs.ramOnKill;
                const totalQueueCost = filteredItems.reduce((sum, it) => sum + it.cost, 0);
                if (perks.speculation) refund += totalQueueCost * 0.25;
                if (perks.dataRecycler) {
                  const unexecutedCost = filteredItems.slice(activeItemIndex + 1).reduce((sum, it) => sum + it.cost, 0);
                  refund += unexecutedCost * 0.8;
                }
                ramToRefund += refund;
                return null;
              }

              // Network spreading (Ping, Memory Wipe T5/Iconic)
              if (h.name === 'Ping' || (h.name === 'Memory Wipe' && (h.tier === 5 || h.tier === 'Iconic'))) {
                 networkHacksToApply.push({...filteredItems[activeItemIndex]}); // push copy to apply to others
              }

              // Contagion spread
              if (h.name === 'Contagion') {
                contagionSpreadQueue.push({item: {...filteredItems[activeItemIndex]}, sourceQueueId: queue.id});
              }
            }
          }

          // Lock logic: 4 uncompleted items
          const uncompletedCount = filteredItems.filter(it => !it.completed).length;
          const isLocked = uncompletedCount >= 4;
          if (queue.locked !== isLocked) queueModified = true;

          if (queueModified) {
            queuesChanged = true;
            return { ...queue, items: filteredItems, locked: isLocked };
          }
          return queue;
        }).filter(q => q !== null) as import('./types').HackQueue[];

        // Apply any pending refunds
        if (ramToRefund > 0) {
          setCurrentRAM(prev => Math.min(inputs.maxRam, prev + ramToRefund));
        }

        // Apply Network Spreading to all queues
        if (networkHacksToApply.length > 0) {
           nextQueues = nextQueues.map(q => {
              let qModified = false;
              const newQItems = [...q.items];
              for (const netHack of networkHacksToApply) {
                 // Check if already in queue to avoid duplicates maybe? Or just add. The wiki implies it applies effect.
                 // We add a completed version of the hack to the queue to simulate its effect ticking.
                 const hasHack = newQItems.some(i => i.quickhack.name === netHack.quickhack.name && i.completed);
                 if (!hasHack) {
                    newQItems.push({
                       ...netHack,
                       id: crypto.randomUUID(),
                       remainingUploadTime: 0,
                       completed: true,
                       cost: 0 // Free
                    });
                    qModified = true;
                 }
              }
              if (qModified) queuesChanged = true;
              return qModified ? {...q, items: newQItems} : q;
           });
        }

        // Apply Contagion Spreading
        for (const spreadEvent of contagionSpreadQueue) {
           const sourceHack = spreadEvent.item.quickhack;
           let spreadLimit = 2;
           if (sourceHack.tier === 3 || sourceHack.tier === 4 || sourceHack.tier === 5 || sourceHack.tier === 'Iconic') {
              spreadLimit = 4;
           }

           const isRaven = inputs.selectedCyberdeckId === 'raven-mk5';

           const emptyQueues = nextQueues.filter(q => q.id !== spreadEvent.sourceQueueId && q.items.length === 0);

           if (emptyQueues.length > 0) {
              if (isRaven) {
                 // Spread to all up to limit
                 const queuesToInfect = emptyQueues.slice(0, spreadLimit);
                 for (const targetQ of queuesToInfect) {
                    targetQ.items.push({
                       ...spreadEvent.item,
                       id: crypto.randomUUID(),
                       remainingUploadTime: sourceHack.uploadTime,
                       completed: false,
                       cost: 0
                    });
                    queuesChanged = true;
                 }
              } else {
                 // Spread to one
                 emptyQueues[0].items.push({
                    ...spreadEvent.item,
                    id: crypto.randomUUID(),
                    remainingUploadTime: sourceHack.uploadTime,
                    completed: false,
                    cost: 0
                 });
                 queuesChanged = true;
              }
           }
        }

        // Auto create queue logic
        // We auto-create if no queues exist, OR if autoCreateQueues is ON and the active queue just locked.
        const activeQueue = nextQueues.find(q => q.id === activeQueueId);
        let shouldAutoCreate = nextQueues.length === 0;

        if (inputs.autoCreateQueues && activeQueue && activeQueue.locked) {
           // check if there's already an empty unlocked queue we could switch to?
           // No, user requested: "A new queue should be auto created with that toggle if an old one locks or if the enemy is neutralized."
           const hasEmpty = nextQueues.some(q => q.items.length === 0);
           if (!hasEmpty) {
               shouldAutoCreate = true;
           }
        }

        if (shouldAutoCreate) {
           const emptyQueue: import('./types').HackQueue = { id: crypto.randomUUID(), items: [], locked: false };
           setActiveQueueId(emptyQueue.id);
           nextQueues.push(emptyQueue);
           queuesChanged = true;
        } else if (!activeQueue && nextQueues.length > 0) {
           // Active queue was killed, pick another or create one if autoCreate is on
           if (inputs.autoCreateQueues) {
               const emptyQueue: import('./types').HackQueue = { id: crypto.randomUUID(), items: [], locked: false };
               setActiveQueueId(emptyQueue.id);
               nextQueues.push(emptyQueue);
               queuesChanged = true;
           } else {
               setActiveQueueId(nextQueues[0].id);
           }
        }

        return queuesChanged || nextQueues.length !== prevQueues.length ? nextQueues : prevQueues;
      });

    }, tickRateMs);

    return () => clearInterval(interval);
  }, [inputs, perks, activeQueueId, currentRAM, cyberwareCooldownRemaining]);

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8">
      <header className="text-3xl font-bold text-center border-b border-sky-500 pb-4">
        Cyberpunk 2077 RAM Simulator
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-4 border border-sky-800 p-4 rounded bg-slate-900">
          <h2 className="text-xl font-bold text-sky-400">Settings</h2>

                    <label className="flex justify-between items-center">
            <span>Cyberdeck:</span>
            <select className="w-48 bg-slate-800 border border-sky-700 text-sky-300 p-1"
                    value={inputs.selectedCyberdeckId}
                    onChange={e => {
                        const val = e.target.value;
                        const deck = CYBERDECKS.find(d => d.id === val);
                        setInputs({...inputs, selectedCyberdeckId: val, maxRam: deck ? deck.maxRam : inputs.maxRam})
                    }}>
              {CYBERDECKS.map(d => <option key={d.id} value={d.id} disabled={d.id === 'canto-mk6'}>{d.name}</option>)}
            </select>
          </label>
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
          <label className="flex justify-between items-center text-amber-300">
            <span>Time Slowdown (%):</span>
            <input type="range" min="0" max="100" className="w-32 accent-amber-500" value={inputs.timeSlowdown} onChange={e => setInputs({...inputs, timeSlowdown: Number(e.target.value)})} />
            <span className="w-10 text-right">{inputs.timeSlowdown}%</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer mt-2 text-sky-300">
            <input type="checkbox" checked={inputs.autoCreateQueues} onChange={e => setInputs({...inputs, autoCreateQueues: e.target.checked})} className="accent-sky-500" />
            Auto-create Queues on Lock/Kill
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
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-sky-800 bg-slate-900 checked:bg-sky-500"
                checked={perks.queueAcceleration} onChange={e => setPerks({...perks, queueAcceleration: e.target.checked})} />
              <span className="group-hover:text-sky-300">Queue-Acceleration (+60% speed 3rd+)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-sky-800 bg-slate-900 checked:bg-sky-500"
                checked={perks.queuePrioritization} onChange={e => setPerks({...perks, queuePrioritization: e.target.checked})} />
              <span className="group-hover:text-sky-300">Queue Prioritization (+50% speed 1st if 2+ queued)</span>
            </label>

          <h2 className="text-xl font-bold text-sky-400 mt-4 border-t border-sky-800 pt-4">Cyberware</h2>
          <label className="flex justify-between items-center">
            <span>Cyberware:</span>
            <select className="w-48 bg-slate-800 border border-sky-700 text-sky-300 p-1"
                    value={inputs.cyberware}
                    onChange={e => setInputs({...inputs, cyberware: e.target.value as InputState['cyberware']})}>
              <option value="none">None</option>
              <option value="camillo">Camillo RAM Manager</option>
              <option value="reallocator">RAM Reallocator</option>
            </select>
          </label>
          <label className="flex justify-between items-center">
            <span>Intelligence:</span>
            <input type="number" min="3" max="20" className="w-20 bg-slate-800 border border-sky-700 text-sky-300 p-1" value={inputs.intelligence} onChange={e => setInputs({...inputs, intelligence: Number(e.target.value)})} />
          </label>
          <div className="flex justify-between items-center text-sm text-sky-200 mt-2">
            <span>Cyberware Cooldown:</span>
            <span>{cyberwareCooldownRemaining.toFixed(1)}s</span>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-4 border border-sky-800 p-4 rounded bg-slate-900">
          <div className="sticky top-0 z-20 bg-slate-900 p-4 border-b-2 border-sky-600 shadow-md shadow-slate-900/50 -mx-4 -mt-4 mb-0 rounded-t">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-sky-400">Current RAM</h2>
              <div className="text-3xl font-mono text-cyan-400">{Math.floor(currentRAM)} / {inputs.maxRam}</div>
            </div>
            <div className="w-full bg-slate-800 h-6 rounded overflow-hidden border border-sky-900 relative mt-2">
              <div className="h-full bg-cyan-600 transition-all duration-100 ease-linear" style={{ width: `${Math.min(100, Math.max(0, (currentRAM / inputs.maxRam) * 100))}%` }}></div>
            </div>
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
            inputs={inputs}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
