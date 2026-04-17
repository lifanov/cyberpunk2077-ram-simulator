import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { HackQueue, PerkState, Quickhack, QueueItem, InputState } from '../types';
import { CYBERDECKS } from '../data/cyberdecks';

interface QueueSystemProps {
  queues: HackQueue[];
  setQueues: React.Dispatch<React.SetStateAction<HackQueue[]>>;
  activeQueueId: string | null;
  setActiveQueueId: React.Dispatch<React.SetStateAction<string | null>>;
  cyberdeck: (Quickhack | null)[];
  currentRAM: number;
  setCurrentRAM: React.Dispatch<React.SetStateAction<number>>;
  perks: PerkState;
  inputs: InputState;
}

export function QueueSystem({ queues, setQueues, activeQueueId, setActiveQueueId, cyberdeck, currentRAM, setCurrentRAM, perks, inputs }: QueueSystemProps) {

  const addQueue = () => {
    const newQueue: HackQueue = { id: uuidv4(), items: [], locked: false };
    setQueues([...queues, newQueue]);
    if (!activeQueueId) setActiveQueueId(newQueue.id);
  };

  const calculateCost = (hack: Quickhack, isFourthSlot: boolean) => {
    let cost = hack.baseCost;

    // Apply Cyberdeck modifiers
    const activeDeck = CYBERDECKS.find(d => d.id === inputs.selectedCyberdeckId);
    if (activeDeck && activeDeck.bonus.covertRamDiscount && hack.category === 'Covert') {
        cost = Math.max(1, cost - activeDeck.bonus.covertRamDiscount);
    }

    if (isFourthSlot && perks.queueMastery) {
      return Math.max(1, Math.floor(cost / 2));
    }
    return cost;
  };

  const handleAddHackToQueue = (hack: Quickhack) => {
    if (!activeQueueId) {
      alert("No active queue selected.");
      return;
    }

    const activeQueueIndex = queues.findIndex(q => q.id === activeQueueId);
    if (activeQueueIndex === -1) return;

    const queue = queues[activeQueueIndex];
    if (queue.locked) {
      alert("This queue is full/locked. Wait for it to drain.");
      return;
    }

    const isFourthSlot = queue.items.filter(it => !it.completed).length === 3;
    const cost = calculateCost(hack, isFourthSlot);

    if (currentRAM < cost) {
      alert("Not enough RAM.");
      return;
    }

    setCurrentRAM(prev => prev - cost);


    let uploadTime = hack.uploadTime;
    const activeDeck = CYBERDECKS.find(d => d.id === inputs.selectedCyberdeckId);
    if (activeDeck && activeDeck.bonus.combatUploadReduction && hack.category === 'Combat') {
        uploadTime = uploadTime * (1 - activeDeck.bonus.combatUploadReduction);
    }

    const newItem: QueueItem = {
      id: uuidv4(),
      quickhack: hack,
      remainingUploadTime: uploadTime,
      cost,
      completed: false,
      activeDuration: hack.duration,
    };

    const newQueues = [...queues];
    const newItems = [...queue.items, newItem];
    newQueues[activeQueueIndex] = {
      ...queue,
      items: newItems,
      locked: newItems.filter(it => !it.completed).length >= 4,
    };

    setQueues(newQueues);
  };

  return (
    <div className="flex flex-col gap-6 border border-sky-800 p-4 rounded bg-slate-900 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-sky-400">Upload Queues</h2>
        <button
          onClick={addQueue}
          className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded font-bold transition-colors"
        >
          + Add Queue
        </button>
      </div>

      <div className="flex flex-col gap-4 min-h-32">
        {queues.length === 0 && (
          <div className="text-slate-500 italic text-center p-4">No active queues.</div>
        )}
        {queues.map((q, i) => (
          <div key={q.id} className={`flex items-center gap-4 p-2 rounded border-2 ${activeQueueId === q.id ? 'border-sky-400 bg-slate-800' : 'border-sky-900/50 bg-slate-900'} ${q.locked ? 'opacity-80' : ''}`}>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sky-200">
              <input type="radio" name="activeQueue" className="accent-sky-500" checked={activeQueueId === q.id} onChange={() => setActiveQueueId(q.id)} />
              Q{i + 1}
            </label>
            <div className="flex flex-1 gap-2 border-l border-sky-800 pl-4 overflow-x-auto">
              <div className="flex gap-2 min-w-max border-r border-sky-900 pr-4 relative mt-4">
                <span className="text-xs text-sky-500 absolute -top-5 left-0 bg-slate-900 px-1">Uploading</span>
                {[0, 1, 2, 3].map(slotIndex => {
                  const uploadingItems = q.items.filter(it => !it.completed);
                  const item = uploadingItems[slotIndex];
                  if (!item) {
                    return <div key={slotIndex} className="w-16 h-16 shrink-0 border border-dashed border-sky-900 rounded bg-slate-900 flex items-center justify-center text-sky-900 text-xs">Empty</div>;
                  }
                  const progress = item.completed ? 100 : Math.max(0, 100 - (item.remainingUploadTime / item.quickhack.uploadTime) * 100);
                  return (
                    <div key={item.id} className="w-16 h-16 shrink-0 border border-sky-600 rounded relative overflow-hidden bg-slate-800 flex flex-col items-center justify-center p-1">
                      <div className="absolute top-0 left-0 h-full bg-cyan-700/50 z-0 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                      <span className="relative z-10 text-[10px] font-bold text-sky-200 text-center leading-tight">{item.quickhack.name}</span>
                      <span className="relative z-10 text-[9px] text-yellow-500">T{item.quickhack.tier} • {item.cost}R</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 min-w-max relative mt-4">
                <span className="text-xs text-emerald-500 absolute -top-5 left-0 bg-slate-900 px-1">Active Effects</span>
                {q.items.filter(it => it.completed && it.activeDuration > 0).map(item => {
                  const progress = Math.max(0, (item.activeDuration / item.quickhack.duration) * 100);
                  return (
                    <div key={item.id} className="w-16 h-16 shrink-0 border border-emerald-600 rounded relative overflow-hidden bg-slate-800 flex flex-col items-center justify-center p-1 opacity-80">
                      <div className="absolute top-0 left-0 h-full bg-emerald-900/50 z-0 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
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
            {q.locked && <div className="text-red-500 text-sm font-bold uppercase tracking-widest px-2">LOCKED</div>}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-sky-800">
        <h3 className="text-lg font-bold text-sky-400 mb-4">Execute Quickhack (to Active Queue)</h3>
        <div className="grid grid-cols-4 gap-4">
                    {cyberdeck.map((hack, idx) => {
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
                className={`h-20 flex flex-col items-center justify-center p-2 rounded transition-colors ${
                  isUnimplemented ? 'bg-red-900/10 border-red-900/50 text-slate-600 cursor-not-allowed' :
                  !canAfford ? 'bg-red-900/20 border-red-900 text-slate-500 cursor-not-allowed' :
                  'bg-sky-900/40 border border-sky-600 hover:bg-sky-800 cursor-pointer'
                }`}
              >
                <span className="font-bold text-sm text-sky-200 leading-tight">{hack.name} <span className="text-xs text-yellow-500">T{hack.tier}</span></span>
                <span className={`text-xs mt-1 ${isUnimplemented ? 'text-red-500' : isFourthSlot && perks.queueMastery ? 'text-green-400 font-bold' : 'text-sky-400'}`}>
                  {isUnimplemented ? 'UNIMPLEMENTED' : `Cost: ${currentCost} RAM`}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
}
