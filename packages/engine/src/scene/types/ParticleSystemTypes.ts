import { Entity } from '@ir-engine/ecs'
import { defineState, Schema } from '@ir-engine/hyperflux'
import {
  AdditiveBlending,
  BufferGeometry,
  CustomBlending,
  Material,
  MultiplyBlending,
  NoBlending,
  NormalBlending,
  SubtractiveBlending,
  Texture,
  Vector2,
  Vector3
} from 'three'
import { BatchedRenderer, Behavior, ParticleSystem, ParticleSystemJSONParameters, RenderMode } from 'three.quarks'

/* START Behavior Types */
export type ApplyForceBehaviorJSON = {
  type: 'ApplyForce'
  direction: [number, number, number]
  magnitude: ValueGeneratorJSON
}

export type NoiseBehaviorJSON = {
  type: 'Noise'
  frequency: [number, number, number]
  power: [number, number, number]
  positionAmount: number
  rotationAmount: number
}

export type TurbulenceFieldBehaviorJSON = {
  type: 'TurbulenceField'
  scale: [number, number, number]
  octaves: number
  velocityMultiplier: [number, number, number]
  timeScale: [number, number, number]
}

export type GravityForceBehaviorJSON = {
  type: 'GravityForce'
  center: [number, number, number]
  magnitude: number
}

export type ColorOverLifeBehaviorJSON = {
  type: 'ColorOverLife'
  color: ColorGeneratorJSON
}

export type RotationOverLifeBehaviorJSON = {
  type: 'RotationOverLife'
  angularVelocity: ValueGeneratorJSON
  dynamic: boolean
}

export type Rotation3DOverLifeBehaviorJSON = {
  type: 'Rotation3DOverLife'
  angularVelocity: RotationGeneratorJSON
  dynamic: boolean
}

export type SizeOverLifeBehaviorJSON = {
  type: 'SizeOverLife'
  size: ValueGeneratorJSON
}

export type SpeedOverLifeBehaviorJSON = {
  type: 'SpeedOverLife'
  speed: ValueGeneratorJSON
}

export type FrameOverLifeBehaviorJSON = {
  type: 'FrameOverLife'
  frame: ValueGeneratorJSON
}

export type ForceOverLifeBehaviorJSON = {
  type: 'ForceOverLife'
  x: ValueGeneratorJSON
  y: ValueGeneratorJSON
  z: ValueGeneratorJSON
}

export type OrbitOverLifeBehaviorJSON = {
  type: 'OrbitOverLife'
  orbitSpeed: ValueGeneratorJSON
  axis: [number, number, number]
}

export type WidthOverLengthBehaviorJSON = {
  type: 'WidthOverLength'
  width: ValueGeneratorJSON
}

export type ChangeEmitDirectionBehaviorJSON = {
  type: 'ChangeEmitDirection'
  angle: ValueGeneratorJSON
}

export type EmitSubParticleSystemBehaviorJSON = {
  type: 'EmitSubParticleSystem'
  subParticleSystem: string
  useVelocityAsBasis: boolean
}

export type BehaviorJSON =
  | ApplyForceBehaviorJSON
  | NoiseBehaviorJSON
  | TurbulenceFieldBehaviorJSON
  | GravityForceBehaviorJSON
  | ColorOverLifeBehaviorJSON
  | RotationOverLifeBehaviorJSON
  | Rotation3DOverLifeBehaviorJSON
  | SizeOverLifeBehaviorJSON
  | SpeedOverLifeBehaviorJSON
  | FrameOverLifeBehaviorJSON
  | ForceOverLifeBehaviorJSON
  | OrbitOverLifeBehaviorJSON
  | WidthOverLengthBehaviorJSON
  | ChangeEmitDirectionBehaviorJSON
  | EmitSubParticleSystemBehaviorJSON
  | ApplySequencesJSON

export const BehaviorJSONDefaults: { [type: string]: BehaviorJSON } = {
  ApplySequences: {
    type: 'ApplySequences',
    delay: 0,
    sequencers: []
  },
  ApplyForce: {
    type: 'ApplyForce',
    direction: [0, 1, 0],
    magnitude: {
      type: 'ConstantValue',
      value: 1
    }
  },
  Noise: {
    type: 'Noise',
    frequency: [1, 1, 1],
    power: [1, 1, 1],
    positionAmount: 0,
    rotationAmount: 0
  },
  TurbulenceField: {
    type: 'TurbulenceField',
    scale: [1, 1, 1],
    octaves: 3,
    velocityMultiplier: [1, 1, 1],
    timeScale: [1, 1, 1]
  },
  GravityForce: {
    type: 'GravityForce',
    center: [0, 0, 0],
    magnitude: 10
  },
  ColorOverLife: {
    type: 'ColorOverLife',
    color: {
      type: 'ConstantColor',
      color: {
        r: 1,
        g: 1,
        b: 1,
        a: 1
      }
    }
  },
  RotationOverLife: {
    type: 'RotationOverLife',
    angularVelocity: {
      type: 'ConstantValue',
      value: 0.15
    },
    dynamic: false
  },
  Rotation3DOverLife: {
    type: 'Rotation3DOverLife',
    angularVelocity: {
      type: 'RandomQuat'
    },
    dynamic: false
  },
  SizeOverLife: {
    type: 'SizeOverLife',
    size: {
      type: 'ConstantValue',
      value: 0
    }
  },
  SpeedOverLife: {
    type: 'SpeedOverLife',
    speed: {
      type: 'ConstantValue',
      value: 1
    }
  },
  FrameOverLife: {
    type: 'FrameOverLife',
    frame: {
      type: 'ConstantValue',
      value: 0
    }
  },
  ForceOverLife: {
    type: 'ForceOverLife',
    x: {
      type: 'ConstantValue',
      value: 0
    },
    y: {
      type: 'ConstantValue',
      value: 1
    },
    z: {
      type: 'ConstantValue',
      value: 0
    }
  },
  OrbitOverLife: {
    type: 'OrbitOverLife',
    orbitSpeed: {
      type: 'ConstantValue',
      value: 0
    },
    axis: [0, 1, 0]
  },
  WidthOverLength: {
    type: 'WidthOverLength',
    width: {
      type: 'ConstantValue',
      value: 1
    }
  },
  ChangeEmitDirection: {
    type: 'ChangeEmitDirection',
    angle: {
      type: 'ConstantValue',
      value: 1.4
    }
  },
  EmitSubParticleSystem: {
    type: 'EmitSubParticleSystem',
    subParticleSystem: '',
    useVelocityAsBasis: false
  }
}
/* END Behavior Types */

/* START Color Generator Types */
export type ColorJSON = {
  r: number
  g: number
  b: number
  a: number
}

export type ConstantColorJSON = {
  type: 'ConstantColor'
  color: ColorJSON
}

export type ColorRangeJSON = {
  type: 'ColorRange'
  a: ColorJSON
  b: ColorJSON
}

export type RandomColorJSON = {
  type: 'RandomColor'
  a: ColorJSON
  b: ColorJSON
}

export type ColorGradientFunctionJSON = {
  function: ColorRangeJSON
  start: number
}

export type ColorGradientJSON = {
  type: 'Gradient'
  functions: ColorGradientFunctionJSON[]
}

export type ColorGeneratorJSON = ConstantColorJSON | ColorRangeJSON | RandomColorJSON | ColorGradientJSON

export const ColorGeneratorJSONDefaults: Record<string, ColorGeneratorJSON> = {
  ConstantColor: {
    type: 'ConstantColor',
    color: { r: 1, g: 1, b: 1, a: 1 }
  },
  ColorRange: {
    type: 'ColorRange',
    a: { r: 1, g: 1, b: 1, a: 1 },
    b: { r: 1, g: 1, b: 1, a: 1 }
  },
  RandomColor: {
    type: 'RandomColor',
    a: { r: 1, g: 1, b: 1, a: 1 },
    b: { r: 1, g: 1, b: 1, a: 1 }
  },
  Gradient: {
    type: 'Gradient',
    functions: [
      {
        function: {
          type: 'ColorRange',
          a: { r: 1, g: 1, b: 1, a: 1 },
          b: { r: 1, g: 1, b: 1, a: 1 }
        },
        start: 0
      }
    ]
  }
}
/* END Color Generator Types */

/* START Rotation Generator Types */
export type AxisAngleGeneratorJSON = {
  type: 'AxisAngle'
  axis: [number, number, number]
  angle: ValueGeneratorJSON
}

export type EulerGeneratorJSON = {
  type: 'Euler'
  angleX: ValueGeneratorJSON
  angleY: ValueGeneratorJSON
  angleZ: ValueGeneratorJSON
}

export type RandomQuatGeneratorJSON = {
  type: 'RandomQuat'
}

export type RotationGeneratorJSON = AxisAngleGeneratorJSON | EulerGeneratorJSON | RandomQuatGeneratorJSON

export const RotationGeneratorJSONDefaults: Record<string, RotationGeneratorJSON> = {
  AxisAngle: {
    type: 'AxisAngle',
    axis: [0, 1, 0],
    angle: {
      type: 'ConstantValue',
      value: 0
    }
  },
  Euler: {
    type: 'Euler',
    angleX: {
      type: 'ConstantValue',
      value: 0
    },
    angleY: {
      type: 'ConstantValue',
      value: 0
    },
    angleZ: {
      type: 'ConstantValue',
      value: 0
    }
  },
  RandomQuat: {
    type: 'RandomQuat'
  }
}
/* END Rotation Generator Types */

/* START Sequencer Types */
export type TextureSequencerJSON = {
  scaleX: number
  scaleY: number
  position: Vector3
  locations: Vector2[]
  src: string
  threshold: number
}

export type SequencerJSON = TextureSequencerJSON

export type ApplySequencesJSON = {
  type: 'ApplySequences'
  delay: number
  sequencers: {
    range: IntervalValueJSON
    sequencer: SequencerJSON
  }[]
}

export type BurstParametersJSON = {
  time: number
  count: number
  cycle: number
  interval: number
  probability: number
}
/* END Sequencer Types */

/* START Shapes Types */
export type PointShapeJSON = {
  type: 'point'
}

export type SphereShapeJSON = {
  type: 'sphere'
  radius?: number
}

export type ConeShapeJSON = {
  type: 'cone'
  radius?: number
  arc?: number
  thickness?: number
  angle?: number
}

export type DonutShapeJSON = {
  type: 'donut'
  radius?: number
  arc?: number
  thickness?: number
  angle?: number
}

export type MeshShapeJSON = {
  type: 'mesh_surface'
  mesh?: string
  geometry: BufferGeometry
}

export type GridShapeJSON = {
  type: 'grid'
  width?: number
  height?: number
  column?: number
  row?: number
}

export type EmitterShapeJSON =
  | PointShapeJSON
  | SphereShapeJSON
  | ConeShapeJSON
  | MeshShapeJSON
  | GridShapeJSON
  | DonutShapeJSON

export const POINT_SHAPE_DEFAULT: PointShapeJSON = {
  type: 'point'
}

export const SPHERE_SHAPE_DEFAULT: SphereShapeJSON = {
  type: 'sphere',
  radius: 1
}

export const CONE_SHAPE_DEFAULT: ConeShapeJSON = {
  type: 'cone',
  radius: 1,
  arc: 0.2,
  thickness: 4,
  angle: 30
}

export const DONUT_SHAPE_DEFAULT: DonutShapeJSON = {
  type: 'donut',
  radius: 1,
  arc: 30,
  thickness: 0.5,
  angle: 15
}

export const MESH_SHAPE_DEFAULT: MeshShapeJSON = {
  type: 'mesh_surface',
  mesh: '',
  geometry: new BufferGeometry()
}

export const GRID_SHAPE_DEFAULT: GridShapeJSON = {
  type: 'grid',
  width: 1,
  height: 1,
  column: 1,
  row: 1
}
/* END Shapes Types */

/* START Value Generator Types */
export type ConstantValueJSON = {
  type: 'ConstantValue'
  value: number
}

export type IntervalValueJSON = {
  type: 'IntervalValue'
  a: number
  b: number
}

export type BezierFunctionJSON = {
  function: {
    p0: number
    p1: number
    p2: number
    p3: number
  }
  start: number
}

export type PiecewiseBezierValueJSON = {
  type: 'PiecewiseBezier'
  functions: BezierFunctionJSON[]
}

export type ValueGeneratorJSON = ConstantValueJSON | IntervalValueJSON | PiecewiseBezierValueJSON

export const ValueGeneratorJSONDefaults: Record<string, ValueGeneratorJSON> = {
  ConstantValue: {
    type: 'ConstantValue',
    value: 1
  },
  IntervalValue: {
    type: 'IntervalValue',
    a: 0,
    b: 1
  },
  PiecewiseBezier: {
    type: 'PiecewiseBezier',
    functions: [
      {
        function: {
          p0: 0,
          p1: 0,
          p2: 1,
          p3: 1
        },
        start: 0
      }
    ]
  }
}
/* END Value Generator Types */

export type ParticleSystemRendererInstance = {
  renderer: BatchedRenderer
  rendererEntity: Entity
  instanceCount: number
}

export type RendererSettingsJSON = {
  // Trail mode settings
  startLength?: ValueGeneratorJSON
  followLocalOrigin?: boolean

  // StretchedBillBoard mode settings
  speedFactor?: number
  lengthFactor?: number
}

export type ExtraSystemJSON = {
  instancingGeometry: string
  startColor: ColorGeneratorJSON
  startRotation: ValueGeneratorJSON
  startSize: ValueGeneratorJSON
  startSpeed: ValueGeneratorJSON
  startLife: ValueGeneratorJSON
  behaviors: BehaviorJSON[]
  emissionBursts: BurstParametersJSON[]
  rendererEmitterSettings?: RendererSettingsJSON
}

export type ExpandedSystemJSON = ParticleSystemJSONParameters & ExtraSystemJSON

export type ParticleSystemMetadata = {
  geometries: { [key: string]: BufferGeometry }
  materials: { [key: string]: Material }
  textures: { [key: string]: Texture }
}

export type ParticleSystemComponentType = {
  systemParameters: ExpandedSystemJSON
  behaviorParameters: BehaviorJSON[]

  system?: ParticleSystem | undefined
  behaviors?: Behavior[] | undefined
}

export const ParticleState = defineState({
  name: 'ParticleState',
  initial: () => ({
    renderers: {} as Record<Entity, ParticleSystemRendererInstance>
  })
})

const BlendingSchema = Schema.LiteralUnion(
  [NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, CustomBlending],
  { default: AdditiveBlending }
)

export const DEFAULT_EMISSION_OVER_TIME = 400

export const DEFAULT_PARTICLE_SYSTEM_PARAMETERS = Schema.Object({
  version: Schema.String({ default: '1.0' }),
  autoDestroy: Schema.Bool({ default: false }),
  looping: Schema.Bool({ default: true }),
  prewarm: Schema.Bool({ default: false }),
  material: Schema.String({ default: '' }),
  transparent: Schema.Optional(Schema.Bool()),
  duration: Schema.Number({ default: 5 }),
  shape: Schema.Object({
    type: Schema.String({ default: 'point' }),
    mesh: Schema.Optional(Schema.String()),
    geometry: Schema.Optional(Schema.String())
  }),
  startLife: Schema.Object({
    type: Schema.String({ default: 'IntervalValue' }),
    a: Schema.Number({ default: 1 }),
    b: Schema.Number({ default: 2 }),
    value: Schema.Number({ default: 1 }),
    functions: Schema.Array(Schema.Type<BezierFunctionJSON>())
  }),
  startSpeed: Schema.Object({
    type: Schema.String({ default: 'IntervalValue' }),
    a: Schema.Number({ default: 0.1 }),
    b: Schema.Number({ default: 5 }),
    value: Schema.Number({ default: 1 }),
    functions: Schema.Array(Schema.Type<BezierFunctionJSON>())
  }),
  startRotation: Schema.Object({
    type: Schema.String({ default: 'IntervalValue' }),
    a: Schema.Number({ default: 0 }),
    b: Schema.Number({ default: 300 }),
    value: Schema.Number({ default: 1 }),
    functions: Schema.Array(Schema.Type<BezierFunctionJSON>())
  }),
  startSize: Schema.Object({
    type: Schema.String({ default: 'IntervalValue' }),
    a: Schema.Number({ default: 0.025 }),
    b: Schema.Number({ default: 0.45 }),
    value: Schema.Number({ default: 1 }),
    functions: Schema.Array(Schema.Type<BezierFunctionJSON>())
  }),
  startColor: Schema.Object({
    type: Schema.String({ default: 'ConstantColor' }),
    color: Schema.Object({
      r: Schema.Number({ default: 1 }),
      g: Schema.Number({ default: 1 }),
      b: Schema.Number({ default: 1 }),
      a: Schema.Number({ default: 0.1 })
    }),
    a: Schema.Object({
      r: Schema.Number({ default: 1 }),
      g: Schema.Number({ default: 1 }),
      b: Schema.Number({ default: 1 }),
      a: Schema.Number({ default: 1 })
    }),
    b: Schema.Object({
      r: Schema.Number({ default: 1 }),
      g: Schema.Number({ default: 1 }),
      b: Schema.Number({ default: 1 }),
      a: Schema.Number({ default: 1 })
    }),
    functions: Schema.Array(Schema.Type<ColorGradientFunctionJSON>())
  }),
  emissionOverTime: Schema.Object({
    type: Schema.String({ default: 'ConstantValue' }),
    value: Schema.Number({ default: DEFAULT_EMISSION_OVER_TIME }),
    a: Schema.Number({ default: 0 }),
    b: Schema.Number({ default: 1 }),
    functions: Schema.Array(Schema.Type<BezierFunctionJSON>())
  }),
  emissionOverDistance: Schema.Object({
    type: Schema.String({ default: 'ConstantValue' }),
    value: Schema.Number({ default: 0 }),
    a: Schema.Number({ default: 0 }),
    b: Schema.Number({ default: 1 }),
    functions: Schema.Array(Schema.Type<BezierFunctionJSON>())
  }),
  emissionBursts: Schema.Array(
    Schema.Object({
      time: Schema.Number(),
      count: Schema.Number(),
      cycle: Schema.Number(),
      interval: Schema.Number(),
      probability: Schema.Number()
    })
  ),
  onlyUsedByOther: Schema.Bool({ default: false }),
  rendererEmitterSettings: Schema.Optional(
    Schema.Object({
      startLength: Schema.Optional(Schema.Type<ValueGeneratorJSON>()),
      followLocalOrigin: Schema.Optional(Schema.Bool({ default: false })),

      speedFactor: Schema.Optional(Schema.Number({ default: 1 })),
      lengthFactor: Schema.Optional(Schema.Number({ default: 1 }))
    })
  ),
  renderMode: Schema.LiteralUnion(Object.values(RenderMode), {
    $comment:
      "A number enum, where: 0 represents 'BillBoard', 1 represents 'StretchedBillBoard', 2 represents 'Mesh', 3 represents 'Trail'",
    default: RenderMode.BillBoard
  }),
  texture: Schema.String({ default: '' }),
  /**
   * particle mesh geometry
   */
  instancingGeometry: Schema.String({ default: '' }),
  startTileIndex: Schema.Object({
    type: Schema.String({ default: 'ConstantValue' }),
    value: Schema.Number({ default: 0 }),
    a: Schema.Number({ default: 0 }),
    b: Schema.Number({ default: 1 }),
    functions: Schema.Array(Schema.Type<BezierFunctionJSON>())
  }),
  uTileCount: Schema.Number({ default: 1 }),
  vTileCount: Schema.Number({ default: 1 }),
  blending: BlendingSchema,
  behaviors: Schema.Array(Schema.Type<BehaviorJSON>()),
  worldSpace: Schema.Bool({ default: true })
})
