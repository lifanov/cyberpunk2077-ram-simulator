const fs = require('fs');

// We should use sensors for dnd-kit to support mouse and touch optimally
let deckFile = fs.readFileSync('src/components/Cyberdeck.tsx', 'utf8');
deckFile = deckFile.replace("import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';",
"import { DndContext, DragOverlay, useDraggable, useDroppable, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';");

const sensorsCode = `  const sensors = useSensors(
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

  const handleDragStart = (event: DragStartEvent) => {`;

deckFile = deckFile.replace("const handleDragStart = (event: DragStartEvent) => {", sensorsCode);
deckFile = deckFile.replace("<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>",
"<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>");

fs.writeFileSync('src/components/Cyberdeck.tsx', deckFile);
console.log('added sensors');
