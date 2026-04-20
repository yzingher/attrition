import { PlayerEconomy, ProductionNode, NodeType, PRODUCTION_CONSTANTS as C } from './types'

export function createInitialEconomy(dispersed: boolean = false): PlayerEconomy {
  const makeNode = (type: NodeType, count: number): ProductionNode[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `${type}-${i}`,
      type,
      player: 1 as const,
      health: 100,
      maxHealth: 100,
      throughput: getBaseThroughput(type) * (dispersed ? C.DISPERSED_THROUGHPUT_MULT : 1),
      baseThroughput: getBaseThroughput(type),
      dispersed,
      level: 1,
      buildCost: C.BUILD_COSTS[type] * (dispersed ? C.DISPERSED_COST_MULT : 1),
      active: true,
    }))

  return {
    resources: { raw: 20, components: 10, assembled: 5 },
    productionNodes: [
      ...makeNode('raw', 2),
      ...makeNode('component', 1),
      ...makeNode('assembly', 1),
      ...makeNode('energy', 1),
      ...makeNode('human-capital', 1),
    ],
    energyOutput: 1,
    humanCapital: 1,
    totalProduced: 0,
    productionRate: 0,
    peakProductionRate: 0,
    productionHistory: [],
  }
}

function getBaseThroughput(type: NodeType): number {
  switch (type) {
    case 'raw': return C.RAW_PER_TICK
    case 'component': return C.COMPONENTS_PER_TICK
    case 'assembly': return C.ASSEMBLY_PER_TICK
    case 'energy': return C.ENERGY_MULTIPLIER_PER_NODE
    case 'human-capital': return C.HUMAN_CAPITAL_MULTIPLIER
  }
}

export function tickEconomy(economy: PlayerEconomy, tick: number): PlayerEconomy {
  const nodes = economy.productionNodes
  const resources = { ...economy.resources }

  // Calculate multipliers from energy and human capital
  const energyNodes = nodes.filter(n => n.type === 'energy' && n.active && n.health > 0)
  const humanNodes = nodes.filter(n => n.type === 'human-capital' && n.active && n.health > 0)

  const energyMult = energyNodes.reduce((sum, n) => sum + (n.throughput * n.health / 100), 0)
  const humanMult = humanNodes.reduce((sum, n) => sum + (n.throughput * n.health / 100), 0)

  const globalMult = (1 + energyMult) * (1 + humanMult)

  // Step 1: Raw input generation
  const rawNodes = nodes.filter(n => n.type === 'raw' && n.active && n.health > 0)
  for (const node of rawNodes) {
    const output = node.throughput * (node.health / 100) * globalMult
    resources.raw += output
  }

  // Step 2: Component production (consumes raw)
  const compNodes = nodes.filter(n => n.type === 'component' && n.active && n.health > 0)
  for (const node of compNodes) {
    const canProduce = node.throughput * (node.health / 100) * globalMult
    const rawNeeded = canProduce * C.RAW_PER_COMPONENT
    if (resources.raw >= rawNeeded) {
      resources.raw -= rawNeeded
      resources.components += canProduce
    } else {
      // Partial production
      const actualProd = resources.raw / C.RAW_PER_COMPONENT
      resources.raw = 0
      resources.components += actualProd
    }
  }

  // Step 3: Assembly (consumes components, produces drones)
  const assemblyNodes = nodes.filter(n => n.type === 'assembly' && n.active && n.health > 0)
  let dronesProduced = 0
  for (const node of assemblyNodes) {
    const canProduce = node.throughput * (node.health / 100) * globalMult
    const compsNeeded = canProduce * C.COMPONENTS_PER_DRONE
    if (resources.components >= compsNeeded) {
      resources.components -= compsNeeded
      resources.assembled += canProduce
      dronesProduced += canProduce
    } else {
      const actualProd = resources.components / C.COMPONENTS_PER_DRONE
      resources.components = 0
      resources.assembled += actualProd
      dronesProduced += actualProd
    }
  }

  // Update production rate (rolling average over last 60 ticks)
  const totalProduced = economy.totalProduced + dronesProduced
  const productionRate = dronesProduced * 60 // per minute equivalent

  // Snapshot history every 10 ticks
  const productionHistory = [...economy.productionHistory]
  if (tick % 10 === 0) {
    productionHistory.push(productionRate)
    if (productionHistory.length > 120) productionHistory.shift() // keep 20 min
  }

  return {
    ...economy,
    resources,
    energyOutput: 1 + energyMult,
    humanCapital: 1 + humanMult,
    totalProduced,
    productionRate,
    peakProductionRate: Math.max(economy.peakProductionRate, productionRate),
    productionHistory,
  }
}

export function buildNode(economy: PlayerEconomy, type: NodeType, dispersed: boolean): PlayerEconomy | null {
  const cost = C.BUILD_COSTS[type] * (dispersed ? C.DISPERSED_COST_MULT : 1)
  if (economy.resources.assembled < cost) return null // not enough resources

  const newNode: ProductionNode = {
    id: `${type}-${Date.now()}`,
    type,
    player: 1,
    health: 100,
    maxHealth: 100,
    throughput: getBaseThroughput(type) * (dispersed ? C.DISPERSED_THROUGHPUT_MULT : 1),
    baseThroughput: getBaseThroughput(type),
    dispersed,
    level: 1,
    buildCost: cost,
    active: true,
  }

  return {
    ...economy,
    resources: { ...economy.resources, assembled: economy.resources.assembled - cost },
    productionNodes: [...economy.productionNodes, newNode],
  }
}

export function getEffectiveRegenRate(economy: PlayerEconomy): number {
  // Calculate theoretical max output per minute
  const nodes = economy.productionNodes
  const energyNodes = nodes.filter(n => n.type === 'energy' && n.active && n.health > 0)
  const humanNodes = nodes.filter(n => n.type === 'human-capital' && n.active && n.health > 0)
  const assemblyNodes = nodes.filter(n => n.type === 'assembly' && n.active && n.health > 0)

  const energyMult = energyNodes.reduce((sum, n) => sum + (n.throughput * n.health / 100), 0)
  const humanMult = humanNodes.reduce((sum, n) => sum + (n.throughput * n.health / 100), 0)
  const globalMult = (1 + energyMult) * (1 + humanMult)

  return assemblyNodes.reduce((sum, n) => sum + n.throughput * (n.health / 100) * globalMult * 60, 0)
}
