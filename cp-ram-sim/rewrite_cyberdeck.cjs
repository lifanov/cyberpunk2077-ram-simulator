const fs = require('fs');

const content = `import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
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
      className={\`bg-slate-800 border \${isDragging ? 'border-sky-300 opacity-50' : 'border-slate-600'} p-2 text-sm rounded cursor-grab hover:border-sky-500 hover:bg-slate-700 transition-colors\`}
    >
      <div className="font-bold">{hack.name} <span className="text-xs text-yellow-500 ml-1">T{hack.tier}</span></div>
      <div className="text-xs text-slate-400 flex justify-between mt-1">
        <span>{hack.baseCost} RAM</span>
        <span>{hack.uploadTime}s</span>
      </div>
    </div>
  );
}

function DroppableSlot({ index, slot, removeHack }: { index: number, slot: Quickhack | null, removeHack: (i: number) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: \`slot-\${index}\`,
    data: { index }
  });

  return (
    <div
      ref={setNodeRef}
      className={\`h-24 rounded border-2 border-dashed flex items-center justify-center relative transition-colors \${
        isOver ? 'border-sky-300 bg-slate-700' :
        slot ? 'border-sky-500 bg-slate-800' : 'border-sky-900 bg-slate-900 hover:border-sky-700'
      }\`}
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
          alert(\`You already have a tier of \${hack.name} equipped.\`);
          return;
        }
        const newDeck = [...cyberdeck];
        newDeck[index] = hack;
        setCyberdeck(newDeck);
      }
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6 w-full touch-none">
        <div className="border border-sky-800 p-4 rounded bg-slate-900/50">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Quickhack Library</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(groupedHacks).map(([category, hacks]) => (
              <div key={category} className="flex flex-col gap-2">
                <h3 className="text-sky-300 font-semibold border-b border-sky-800 pb-1">{category}</h3>
                {hacks.map(hack => (
                  <DraggableHack key={hack.id} hack={hack} />
                ))}
              </div>
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
`;

fs.writeFileSync('src/components/Cyberdeck.tsx', content);
console.log('rewrote Cyberdeck.tsx for dnd-kit');
