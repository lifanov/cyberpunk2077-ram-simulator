const fs = require('fs');

const appPath = 'src/App.tsx';
let data = fs.readFileSync(appPath, 'utf8');

const regex = /useEffect\(\(\) => \{[\s\S]*?\}, \[inputs\.maxRam, inputs\.regenRate, inputs\.uploadReduction, inputs\.ramOnKill, perks\]\);/;

const replacement = `useEffect(() => {
    const tickRateMs = 50; // 50ms per tick
    const interval = setInterval(() => {
      const timeScalar = 1 - (inputs.timeSlowdown / 100);
      if (timeScalar <= 0) return; // Completely paused

      // 1. Regenerate RAM
      setCurrentRAM(prev => {
        let baseRegen = inputs.regenRate;
        if (perks.optimization) {
          baseRegen += inputs.regenRate * 0.1;
        }
        const regenAmount = baseRegen * (tickRateMs / 1000) * timeScalar;
        return Math.min(inputs.maxRam, prev + regenAmount);
      });

      // 2. Process Queues and handle Kills/Drains
      setQueues(prevQueues => {
        if (prevQueues.length === 0) return prevQueues;

        const uploadSpeedMultiplier = 1 + (inputs.uploadReduction / 100);
        let queuesChanged = false;
        let ramToRefund = 0;
        let networkHacksToApply: typeof import('./types').QueueItem[] = []; // for ping/memory wipe
        let contagionSpreadQueue: {item: typeof import('./types').QueueItem, sourceQueueId: string}[] = [];

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
              let newQItems = [...q.items];
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

           let emptyQueues = nextQueues.filter(q => q.id !== spreadEvent.sourceQueueId && q.items.length === 0);

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
  }, [inputs, perks, activeQueueId]);`;

data = data.replace(regex, replacement);
fs.writeFileSync(appPath, data);
