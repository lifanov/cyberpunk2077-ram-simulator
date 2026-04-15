const fs = require('fs');

let deckFile = fs.readFileSync('src/components/Cyberdeck.tsx', 'utf8');

// The reviewer noted that I added `touch-none` to the entire container, which prevents scrolling the list on mobile.
// I need to remove it from `<div className="flex flex-col gap-6 w-full touch-none">`
deckFile = deckFile.replace('<div className="flex flex-col gap-6 w-full touch-none">', '<div className="flex flex-col gap-6 w-full">');

// We also need to ensure touch actions are only disabled on the draggable items themselves.
// dnd-kit adds touch-action: none inline to elements using listeners.
// But to be safe we can add touch-none to the draggable div if we want, or just rely on dnd-kit.
// Actually, dnd-kit's default behavior is sufficient.

fs.writeFileSync('src/components/Cyberdeck.tsx', deckFile);
console.log('Fixed touch scroll bug');
