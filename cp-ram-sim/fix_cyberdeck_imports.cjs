const fs = require('fs');

let deckFile = fs.readFileSync('src/components/Cyberdeck.tsx', 'utf8');
deckFile = deckFile.replace("import { DndContext, DragOverlay, useDraggable, useDroppable, DragStartEvent, DragEndEvent } from '@dnd-kit/core';",
"import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';\nimport type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';");
fs.writeFileSync('src/components/Cyberdeck.tsx', deckFile);
console.log('fixed imports');
