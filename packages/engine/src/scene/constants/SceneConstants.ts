export const SceneComplexityWeights = {
  verticesWeight: 0.5,
  trianglesWeight: 1.0,
  texturesMBWeight: 1.0,
  lightsWeight: 1.2,
  drawCallsWeight: 1.5,
  shaderComplexityWeight: 1.0
}

// these are thresholds for the scene complexity
export const SceneComplexity = {
  VeryLight: { label: 'Very Light', value: 50000 } as const,
  Light: { label: 'Light', value: 100000 } as const,
  Medium: { label: 'Medium', value: 150000 } as const,
  Heavy: { label: 'Heavy', value: 200000 } as const,
  VeryHeavy: { label: 'Very Heavy', value: 300000 } as const
}

export type SceneComplexityCategoryType = (typeof SceneComplexity)[keyof typeof SceneComplexity]['label']
export type SceneComplexityValueType = (typeof SceneComplexity)[keyof typeof SceneComplexity]['value']
