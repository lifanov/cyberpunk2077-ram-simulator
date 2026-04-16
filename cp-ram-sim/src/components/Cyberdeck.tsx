import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { QUICKHACKS } from '../data/quickhacks';
import type { Quickhack } from '../types';

interface CyberdeckProps {
  cyberdeck: (Quickhack | null)[];
  setCyberdeck: React.Dispatch<React.SetStateAction<(Quickhack | null)[]>>;
}

function DraggableHack({ hack }: { hack: Quickhack }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: hack.id,
    data: { hack }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-slate-800 border ${isDragging ? 'border-sky-300 opacity-50' : 'border-slate-600'} p-2 text-sm rounded cursor-grab hover:border-sky-500 hover:bg-slate-700 transition-colors touch-none`}
    >
      <div className="flex justify-between items-start">
        <div className="font-bold">{hack.name}</div>
        <div className="text-xs text-sky-400">{hack.category}</div>
      </div>
      <div className="text-xs text-slate-400 flex justify-between mt-1">
        <span>{hack.baseCost} RAM</span>
        <span>{hack.uploadTime}s</span>
      </div>
    </div>
  );
}

function DroppableSlot({ index, slot, removeHack }: { index: number, slot: Quickhack | null, removeHack: (i: number) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { index }
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-24 rounded border-2 border-dashed flex items-center justify-center relative transition-colors ${
        isOver ? 'border-sky-300 bg-slate-700' :
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
  );
}

export function Cyberdeck({ cyberdeck, setCyberdeck }: CyberdeckProps) {
  const [activeHack, setActiveHack] = useState<Quickhack | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('1');

  const removeHack = (index: number) => {
    const newDeck = [...cyberdeck];
    newDeck[index] = null;
    setCyberdeck(newDeck);
  };

  const filteredHacks = QUICKHACKS
    .filter(hack => hack.tier.toString() === selectedTier)
    .sort((a, b) => a.name.localeCompare(b.name));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.hack) {
      setActiveHack(active.data.current.hack);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveHack(null);

    if (over && over.data.current !== undefined) {
      const hack = active.data.current?.hack as Quickhack;
      const index = over.data.current.index as number;

      if (hack) {
        const exists = cyberdeck.some((h, i) => i !== index && h && h.name === hack.name);
        if (exists) {
          alert(`You already have a tier of ${hack.name} equipped.`);
        } else {
          const newDeck = [...cyberdeck];
          newDeck[index] = hack;
          setCyberdeck(newDeck);
        }
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6 w-full">
        <div className="border border-sky-800 p-4 rounded bg-slate-900/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-sky-400">Quickhack Library</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="tier-select" className="text-sky-300">Tier:</label>
              <select
                id="tier-select"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-slate-800 border border-sky-700 text-sky-300 p-1 rounded"
              >
                <option value="1">Tier 1</option>
                <option value="2">Tier 2</option>
                <option value="3">Tier 3</option>
                <option value="4">Tier 4</option>
                <option value="5">Tier 5</option>
                <option value="Iconic">Iconic</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {filteredHacks.map(hack => (
              <DraggableHack key={hack.id} hack={hack} />
            ))}
          </div>
        </div>

        <div className="border border-sky-800 p-4 rounded bg-slate-900">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Cyberdeck Slots (Drag here)</h2>
          <div className="grid grid-cols-4 gap-4">
            {cyberdeck.map((slot, index) => (
              <DroppableSlot key={index} index={index} slot={slot} removeHack={removeHack} />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeHack ? (
          <div className="bg-slate-800 border border-sky-500 p-2 text-sm rounded opacity-80 rotate-3 scale-105 shadow-lg shadow-sky-500/20">
            <div className="font-bold">{activeHack.name} <span className="text-xs text-yellow-500 ml-1">T{activeHack.tier}</span></div>
            <div className="text-xs text-slate-400 flex justify-between mt-1">
              <span>{activeHack.baseCost} RAM</span>
              <span>{activeHack.uploadTime}s</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
