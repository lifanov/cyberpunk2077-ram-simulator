import type { QuickhackDef } from './data/quickhacks';

export type Quickhack = QuickhackDef;

export interface QueueItem {
  id: string; // unique ID for the queued instance
  quickhack: Quickhack;
  remainingUploadTime: number;
  cost: number;
  completed: boolean;
}

export interface HackQueue {
  id: string;
  items: QueueItem[];
  locked: boolean;
}

export interface PerkState {
  optimization: boolean; // Increases RAM regen
  dataRecycler: boolean; // Refunds 80% RAM of unexecuted quickhacks on kill
  speculation: boolean; // Refunds 25% of total queue cost on kill
  queueMastery: boolean; // 4th slot half cost
}

export interface InputState {
  maxRam: number;
  regenRate: number; // RAM per second
  ramOnKill: number;
  uploadReduction: number; // Percentage, 0-100
}
