import React, { useState } from 'react';
import { QUICKHACKS } from '../data/quickhacks';
import type { Quickhack } from '../types';

interface CyberdeckProps {
  cyberdeck: (Quickhack | null)[];
  setCyberdeck: React.Dispatch<React.SetStateAction<(Quickhack | null)[]>>;
}

export function Cyberdeck({ cyberdeck, setCyberdeck }: CyberdeckProps) {
  const [draggedHack, setDraggedHack] = useState<Quickhack | null>(null);

  const handleDragStart = (e: React.DragEvent, hack: Quickhack) => {
    setDraggedHack(hack);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedHack) return;

    // Validation: prevent adding if another tier of the same quickhack name exists
    const exists = cyberdeck.some((h, i) => i !== index && h && h.name === draggedHack.name);
    if (exists) {
      alert(`You already have a tier of ${draggedHack.name} equipped.`);
      return;
    }

    const newDeck = [...cyberdeck];
    newDeck[index] = draggedHack;
    setCyberdeck(newDeck);
    setDraggedHack(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const removeHack = (index: number) => {
    const newDeck = [...cyberdeck];
    newDeck[index] = null;
    setCyberdeck(newDeck);
  };

  const groupedHacks = QUICKHACKS.reduce((acc, hack) => {
    if (!acc[hack.category]) acc[hack.category] = [];
    acc[hack.category].push(hack);
    return acc;
  }, {} as Record<string, Quickhack[]>);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="border border-sky-800 p-4 rounded bg-slate-900/50">
        <h2 className="text-xl font-bold text-sky-400 mb-4">Quickhack Library</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {Object.entries(groupedHacks).map(([category, hacks]) => (
            <div key={category} className="flex flex-col gap-2">
              <h3 className="text-sky-300 font-semibold border-b border-sky-800 pb-1">{category}</h3>
              {hacks.map(hack => (
                <div
                  key={hack.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, hack)}
                  className="bg-slate-800 border border-slate-600 p-2 text-sm rounded cursor-grab hover:border-sky-500 hover:bg-slate-700 transition-colors"
                >
                  <div className="font-bold">{hack.name} <span className="text-xs text-yellow-500 ml-1">T{hack.tier}</span></div>
                  <div className="text-xs text-slate-400 flex justify-between mt-1">
                    <span>{hack.baseCost} RAM</span>
                    <span>{hack.uploadTime}s</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border border-sky-800 p-4 rounded bg-slate-900">
        <h2 className="text-xl font-bold text-sky-400 mb-4">Cyberdeck Slots (Drag here)</h2>
        <div className="grid grid-cols-4 gap-4">
          {cyberdeck.map((slot, index) => (
            <div
              key={index}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
              className={`h-24 rounded border-2 border-dashed flex items-center justify-center relative transition-colors ${
                slot ? 'border-sky-500 bg-slate-800' : 'border-sky-900 bg-slate-900 hover:border-sky-700'
              }`}
            >
              {slot ? (
                <div className="flex flex-col items-center p-2 w-full h-full justify-center text-center group cursor-pointer" onClick={() => removeHack(index)}>
                  <span className="font-bold text-sm text-sky-300 leading-tight">{slot.name}</span>
                  <span className="text-xs text-yellow-500 mt-1">Tier {slot.tier}</span>
                  <div className="absolute inset-0 bg-red-900/80 items-center justify-center hidden group-hover:flex rounded text-red-200 font-bold text-sm">
                    Remove
                  </div>
                </div>
              ) : (
                <span className="text-sky-900 font-bold">Slot {index + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
