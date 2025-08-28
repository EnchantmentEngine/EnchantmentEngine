import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createResizableTypeArray } from '@ir-engine/ecs/src/bitecsLegacy'
import { Schema } from '@ir-engine/hyperflux'
import { VRMHumanBoneList } from '../avatar/maps/VRMHumanBoneList'

export const MotionCaptureRigComponent = defineComponent({
  name: 'MotionCaptureRigComponent',

  schema: Schema.Object({
    prevWorldLandmarks: Schema.Array(
      Schema.Object({ x: Schema.Number(), y: Schema.Number(), z: Schema.Number(), visibility: Schema.Number() })
    ),
    prevScreenLandmarks: Schema.Array(
      Schema.Object({ x: Schema.Number(), y: Schema.Number(), z: Schema.Number(), visibility: Schema.Number() })
    )
  }),

  storage: {
    rig: Object.fromEntries(
      VRMHumanBoneList.map((b) => [
        b,
        {
          x: createResizableTypeArray(Float64Array),
          y: createResizableTypeArray(Float64Array),
          z: createResizableTypeArray(Float64Array),
          w: createResizableTypeArray(Float64Array)
        }
      ])
    ),
    slerpedRig: Object.fromEntries(
      VRMHumanBoneList.map((b) => [
        b,
        {
          x: createResizableTypeArray(Float64Array),
          y: createResizableTypeArray(Float64Array),
          z: createResizableTypeArray(Float64Array),
          w: createResizableTypeArray(Float64Array)
        }
      ])
    ),
    hipPosition: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
    },
    hipRotation: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array),
      w: createResizableTypeArray(Float64Array)
    },
    footOffset: createResizableTypeArray(Float64Array),
    solvingLowerBody: createResizableTypeArray(Uint8Array)
  }
})
