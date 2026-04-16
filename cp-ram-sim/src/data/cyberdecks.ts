export interface CyberdeckDef {
  id: string;
  name: string;
  maxRam: number;
  bonus: {
    covertRamDiscount?: number;
    combatUploadReduction?: number; // decimal e.g. 0.5 for 50%
  };
}

export const CYBERDECKS: CyberdeckDef[] = [
  {
    "id": "none",
    "name": "None (Base Stats)",
    "maxRam": 10,
    "bonus": {}
  },
  {
    "id": "arasaka-mk5",
    "name": "Arasaka Mk.5 (Tier 5)",
    "maxRam": 14,
    "bonus": {
      "covertRamDiscount": 2
    }
  },
  {
    "id": "biotech-mk5",
    "name": "Biotech Σ Mk.5 (Tier 5)",
    "maxRam": 15,
    "bonus": {}
  },
  {
    "id": "netwatch-mk5",
    "name": "NetWatch Netdriver Mk.5 (Tier 5)",
    "maxRam": 13,
    "bonus": {
      "combatUploadReduction": 0.5
    }
  },
  {
    "id": "raven-mk5",
    "name": "Raven Microcyber Mk.5 (Tier 5)",
    "maxRam": 12,
    "bonus": {}
  },
  {
    "id": "tetratronic-mk5",
    "name": "Tetratronic Rippler Mk.5 (Tier 5)",
    "maxRam": 16,
    "bonus": {}
  },
  {
    "id": "stephenson-mk5",
    "name": "Stephenson Tech Mk.5 (Tier 5)",
    "maxRam": 13,
    "bonus": {}
  }
  ,{
    "id": "canto-mk6",
    "name": "Militech Canto Mk.6 (Unimplemented)",
    "maxRam": 10,
    "bonus": {}
  }
];
