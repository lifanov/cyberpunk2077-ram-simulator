const fs = require('fs');

let appFile = fs.readFileSync('src/App.tsx', 'utf8');

// Also need to apply the logic of these perks during simulation loop
// They apply to upload speed multiplier per item, so we have to do it inside the queue loop

let loopCode = `
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

          let currentUploadSpeedMultiplier = uploadSpeedMultiplier;
          if (perks.queuePrioritization && activeItemIndex === 0 && queue.items.length >= 2) {
              currentUploadSpeedMultiplier += 0.5; // +50% speed for 1st if at least 2 queued
          }
          if (perks.queueAcceleration && activeItemIndex >= 2) {
              currentUploadSpeedMultiplier += 0.6; // +60% speed for 3rd or later
          }

          const localTimeToSubtract = (tickRateMs / 1000) * currentUploadSpeedMultiplier;

          const item = newItems[activeItemIndex];
          const newRemainingTime = Math.max(0, item.remainingUploadTime - localTimeToSubtract);
`;

appFile = appFile.replace(/const nextQueues = prevQueues.map\(queue => \{\s+if \(queue.items.length === 0\) return queue;\s+const newItems = \[\.\.\.queue.items\];\s+\/\/ Find the first uncompleted item\s+const activeItemIndex = newItems.findIndex\(item => !item.completed\);\s+\/\/ Check if queue just finished everything naturally \(Drain\)\s+if \(activeItemIndex === -1\) \{\s+\/\/ Already completely finished, just clear it\s+return null;\s+\}\s+const item = newItems\[activeItemIndex\];\s+const newRemainingTime = Math.max\(0, item.remainingUploadTime - timeToSubtract\);/, loopCode);

fs.writeFileSync('src/App.tsx', appFile);
console.log('App loop patched with perks');
