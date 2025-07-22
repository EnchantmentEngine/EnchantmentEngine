
export const NodeCategory = {
  Action: 'Action',
  Logic: 'Logic',
  Engine: 'Engine',
  Variable: 'Variable',
  Flow: 'Flow',
  None: 'None',
  Math: 'Math',
  Debug: 'Debug'
} as const

export type NodeCategory = (typeof NodeCategory)[keyof typeof NodeCategory]
