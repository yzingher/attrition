export interface MapNode {
  id: string
  type: 'raw' | 'component' | 'assembly' | 'energy' | 'human-capital' | 'hq'
  label: string
  x: number // 0-1 normalized
  y: number // 0-1 normalized
  player: 1 | 2
}

export interface MapLandmass {
  points: [number, number][] // normalized polygon points
  color: string
  label?: string
}

export interface MapRoute {
  from: [number, number]
  to: [number, number]
  type: 'sea' | 'air'
}

export interface MapDef {
  id: string
  name: string
  description: string
  matchup: [string, string]
  backgroundColor: string
  gridColor: string
  landmasses: MapLandmass[]
  routes: MapRoute[]
  startingNodes: {
    player1: MapNode[]
    player2: MapNode[]
  }
}

export const MAPS: Record<string, MapDef> = {
  'taiwan-strait': {
    id: 'taiwan-strait',
    name: 'Taiwan Strait',
    description: 'First island chain — 130km of contested water',
    matchup: ['china', 'taiwan'],
    backgroundColor: '#060a10',
    gridColor: '#0a1520',
    landmasses: [
      // Mainland China (left)
      {
        points: [
          [0, 0], [0.28, 0], [0.32, 0.15], [0.30, 0.3],
          [0.28, 0.45], [0.32, 0.6], [0.30, 0.75], [0.28, 0.85],
          [0.25, 1], [0, 1],
        ],
        color: '#0d1a12',
        label: 'Mainland China',
      },
      // Taiwan (right)
      {
        points: [
          [0.62, 0.2], [0.68, 0.15], [0.73, 0.18], [0.75, 0.3],
          [0.74, 0.45], [0.72, 0.6], [0.70, 0.7], [0.66, 0.75],
          [0.63, 0.7], [0.60, 0.55], [0.59, 0.4], [0.60, 0.3],
        ],
        color: '#0d1a17',
        label: 'Taiwan',
      },
      // Kinmen Islands (small, mid-strait)
      {
        points: [
          [0.38, 0.48], [0.40, 0.47], [0.41, 0.49], [0.39, 0.50],
        ],
        color: '#0d1a17',
        label: 'Kinmen',
      },
      // Penghu Islands
      {
        points: [
          [0.50, 0.52], [0.52, 0.50], [0.54, 0.52], [0.53, 0.55], [0.50, 0.55],
        ],
        color: '#0d1a17',
        label: 'Penghu',
      },
      // Philippines hint (bottom-right)
      {
        points: [
          [0.85, 0.85], [0.92, 0.82], [1, 0.88], [1, 1], [0.88, 1],
        ],
        color: '#0a1510',
      },
    ],
    routes: [
      // Major sea lanes
      { from: [0.15, 0.1], to: [0.15, 0.9], type: 'sea' },
      { from: [0.45, 0.1], to: [0.45, 0.9], type: 'sea' },
      // Cross-strait routes
      { from: [0.30, 0.35], to: [0.60, 0.40], type: 'air' },
      { from: [0.30, 0.55], to: [0.60, 0.55], type: 'air' },
      { from: [0.28, 0.70], to: [0.63, 0.65], type: 'air' },
    ],
    startingNodes: {
      player1: [
        { id: 'p1-hq', type: 'hq', label: 'Command HQ', x: 0.12, y: 0.45, player: 1 },
        { id: 'p1-raw', type: 'raw', label: 'Rare Earth Mine', x: 0.08, y: 0.25, player: 1 },
        { id: 'p1-component', type: 'component', label: 'Shenzhen Fabs', x: 0.20, y: 0.35, player: 1 },
        { id: 'p1-assembly', type: 'assembly', label: 'Assembly Complex', x: 0.18, y: 0.55, player: 1 },
        { id: 'p1-energy', type: 'energy', label: 'Power Grid', x: 0.10, y: 0.65, player: 1 },
        { id: 'p1-human', type: 'human-capital', label: 'Engineering Corps', x: 0.15, y: 0.78, player: 1 },
      ],
      player2: [
        { id: 'p2-hq', type: 'hq', label: 'Defense Command', x: 0.68, y: 0.45, player: 2 },
        { id: 'p2-raw', type: 'raw', label: 'Port Import Hub', x: 0.72, y: 0.25, player: 2 },
        { id: 'p2-component', type: 'component', label: 'TSMC Fabs', x: 0.67, y: 0.35, player: 2 },
        { id: 'p2-assembly', type: 'assembly', label: 'Dispersed Assembly', x: 0.70, y: 0.58, player: 2 },
        { id: 'p2-energy', type: 'energy', label: 'Power Grid', x: 0.73, y: 0.68, player: 2 },
        { id: 'p2-human', type: 'human-capital', label: 'Operator Pool', x: 0.65, y: 0.70, player: 2 },
      ],
    },
  },
  'donbas-black-sea': {
    id: 'donbas-black-sea',
    name: 'Donbas / Black Sea',
    description: 'Eastern front — grinding attrition across open steppe',
    matchup: ['russia', 'ukraine'],
    backgroundColor: '#060a10',
    gridColor: '#0a1520',
    landmasses: [
      // Main landmass (everything except Black Sea)
      {
        points: [
          [0, 0], [1, 0], [1, 0.55], [0.85, 0.6], [0.7, 0.65],
          [0.55, 0.7], [0.4, 0.72], [0.25, 0.68], [0.1, 0.62], [0, 0.58],
        ],
        color: '#0d1510',
        label: 'Steppe',
      },
      // Crimea peninsula
      {
        points: [
          [0.45, 0.75], [0.55, 0.73], [0.60, 0.78], [0.58, 0.85],
          [0.52, 0.88], [0.45, 0.85], [0.43, 0.80],
        ],
        color: '#0d1510',
        label: 'Crimea',
      },
    ],
    routes: [
      { from: [0.2, 0.3], to: [0.8, 0.3], type: 'air' },
      { from: [0.3, 0.5], to: [0.7, 0.5], type: 'air' },
      { from: [0.45, 0.75], to: [0.45, 0.5], type: 'sea' },
    ],
    startingNodes: {
      player1: [
        { id: 'p1-hq', type: 'hq', label: 'Moscow Command', x: 0.12, y: 0.15, player: 1 },
        { id: 'p1-raw', type: 'raw', label: 'Ural Inputs', x: 0.08, y: 0.30, player: 1 },
        { id: 'p1-component', type: 'component', label: 'Smuggled Components', x: 0.18, y: 0.25, player: 1 },
        { id: 'p1-assembly', type: 'assembly', label: 'Shahed Assembly', x: 0.22, y: 0.40, player: 1 },
        { id: 'p1-energy', type: 'energy', label: 'Power Grid', x: 0.10, y: 0.45, player: 1 },
        { id: 'p1-human', type: 'human-capital', label: 'Tech Cadre', x: 0.15, y: 0.50, player: 1 },
      ],
      player2: [
        { id: 'p2-hq', type: 'hq', label: 'Kyiv Command', x: 0.72, y: 0.15, player: 2 },
        { id: 'p2-raw', type: 'raw', label: 'Western Imports', x: 0.80, y: 0.20, player: 2 },
        { id: 'p2-component', type: 'component', label: 'Innovation Labs', x: 0.75, y: 0.30, player: 2 },
        { id: 'p2-assembly', type: 'assembly', label: 'FPV Workshops', x: 0.70, y: 0.40, player: 2 },
        { id: 'p2-energy', type: 'energy', label: 'Power Grid', x: 0.78, y: 0.42, player: 2 },
        { id: 'p2-human', type: 'human-capital', label: 'Volunteer Techs', x: 0.68, y: 0.50, player: 2 },
      ],
    },
  },
}

// Map matchup lookup
export function getMapForMatchup(faction1: string, faction2: string): MapDef | null {
  for (const map of Object.values(MAPS)) {
    const [a, b] = map.matchup
    if ((a === faction1 && b === faction2) || (a === faction2 && b === faction1)) {
      return map
    }
  }
  // Default to Taiwan Strait
  return MAPS['taiwan-strait']
}
