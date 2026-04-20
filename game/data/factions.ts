import { FactionId } from '@/lib/store'

export interface FactionDef {
  id: FactionId
  name: string
  shortName: string
  color: string
  accentColor: string
  doctrine: string
  strength: string
  weakness: string
  modifiers: Record<string, number>
}

export const FACTIONS: Record<FactionId, FactionDef> = {
  usa: {
    id: 'usa',
    name: 'United States',
    shortName: 'USA',
    color: '#1a5276',
    accentColor: '#3498db',
    doctrine: 'Exquisite + Autonomous',
    strength: 'Software, counter-drone, energy',
    weakness: 'TSMC chip dependency, slow fabs, high unit cost',
    modifiers: {
      autonomousEfficiency: 1.3,
      counterDroneAccuracy: 1.25,
      productionSpeed: 0.7,
      unitCost: 1.4,
    },
  },
  china: {
    id: 'china',
    name: 'China',
    shortName: 'PRC',
    color: '#922b21',
    accentColor: '#e74c3c',
    doctrine: 'Mass + Exquisite Hybrid',
    strength: 'Vertically integrated, rare earths',
    weakness: 'Taiwan scenario cuts high-end chips; concentrated fabs',
    modifiers: {
      massProductionSpeed: 1.35,
      rareEarthCost: 0.6,
      highEndChipVulnerability: 1.4,
      fabConcentration: 1.3,
    },
  },
  russia: {
    id: 'russia',
    name: 'Russia',
    shortName: 'RUS',
    color: '#1e3a2b',
    accentColor: '#27ae60',
    doctrine: 'Mass Attritable (Shahed-model)',
    strength: 'EW, cheap production',
    weakness: 'Sanctions-degraded components, smuggled chips',
    modifiers: {
      shahedProduction: 1.2,
      precisionGuided: 0.7,
      ewEffectiveness: 1.15,
      componentQuality: 0.8,
    },
  },
  ukraine: {
    id: 'ukraine',
    name: 'Ukraine',
    shortName: 'UKR',
    color: '#1a5276',
    accentColor: '#f1c40f',
    doctrine: 'Distributed FPV',
    strength: 'High innovation rate, dispersed fabs',
    weakness: 'Limited stockpile, dependent on allied imports',
    modifiers: {
      fpvProduction: 1.4,
      innovationRate: 1.3,
      startingStockpile: 0.6,
      dispersalBonus: 1.25,
    },
  },
  iran: {
    id: 'iran',
    name: 'Iran',
    shortName: 'IRN',
    color: '#1e3a2b',
    accentColor: '#16a085',
    doctrine: 'Mass-Attritable Specialist',
    strength: 'Low cost-per-unit, proxy smuggling',
    weakness: 'Concentrated production (Isfahan single-point)',
    modifiers: {
      unitCost: 0.6,
      smugglingEfficiency: 1.2,
      productionConcentration: 1.5,
      techLevel: 0.75,
    },
  },
  taiwan: {
    id: 'taiwan',
    name: 'Taiwan',
    shortName: 'TWN',
    color: '#1a3a4a',
    accentColor: '#00bcd4',
    doctrine: 'Defensive Porcupine',
    strength: 'Chip production, terrain',
    weakness: 'Small scale, chip fabs are both asset and target',
    modifiers: {
      chipProduction: 1.5,
      defensiveBonus: 1.35,
      scaleLimit: 0.7,
      terrainAdvantage: 1.2,
    },
  },
}
