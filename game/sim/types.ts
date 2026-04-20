export type NodeType = 'raw' | 'component' | 'assembly' | 'energy' | 'human-capital'

export interface ProductionNode {
  id: string
  type: NodeType
  player: 1 | 2
  health: number // 0-100
  maxHealth: number
  throughput: number // units per tick at full health
  baseThroughput: number
  dispersed: boolean // concentrated vs dispersed
  level: number // 1-3
  buildCost: number
  active: boolean
}

export interface ResourceState {
  raw: number
  components: number
  assembled: number // ready drones in stockpile
}

export interface PlayerEconomy {
  resources: ResourceState
  productionNodes: ProductionNode[]
  energyOutput: number // 0-1 multiplier
  humanCapital: number // 0-1 multiplier (cannot regenerate)
  totalProduced: number
  productionRate: number // units per minute (rolling average)
  peakProductionRate: number
  productionHistory: number[] // rate snapshots every 10s
}

export interface SimState {
  tick: number
  player1Economy: PlayerEconomy
  player2Economy: PlayerEconomy
}

// Production chain constants
export const PRODUCTION_CONSTANTS = {
  // Ticks per second (game runs at 1 tick/s for now, will be 30Hz later)
  TICK_RATE: 1,

  // Raw input generation per tick per node at full health
  RAW_PER_TICK: 2,

  // Components cost in raw inputs
  RAW_PER_COMPONENT: 3,

  // Components generated per tick per node
  COMPONENTS_PER_TICK: 1,

  // Assembly: components needed per drone
  COMPONENTS_PER_DRONE: 2,

  // Assembly output per tick per node
  ASSEMBLY_PER_TICK: 0.5,

  // Energy node provides this multiplier to all production (stacks)
  ENERGY_MULTIPLIER_PER_NODE: 0.25, // each energy node adds 25% throughput

  // Human capital provides innovation/efficiency bonus
  HUMAN_CAPITAL_MULTIPLIER: 0.2, // each HC node adds 20% efficiency

  // Dispersed node penalties/bonuses
  DISPERSED_COST_MULT: 1.2,
  DISPERSED_THROUGHPUT_MULT: 0.7,
  DISPERSED_SURVIVABILITY: 0.5, // takes 50% less damage

  // Node build costs (resource units)
  BUILD_COSTS: {
    raw: 10,
    component: 25,
    assembly: 20,
    energy: 30,
    'human-capital': 40,
  } as Record<NodeType, number>,

  // Node rebuild time in ticks
  REBUILD_TIME: {
    raw: 30,
    component: 180, // 3 minutes
    assembly: 60,
    energy: 120,
    'human-capital': 9999, // effectively cannot rebuild
  } as Record<NodeType, number>,
}
