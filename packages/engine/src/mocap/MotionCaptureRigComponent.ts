import { S } from '@ir-engine/ecs'
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createResizableTypeArray } from '@ir-engine/ecs/src/bitecsLegacy'
import { VRMHumanBoneList } from '../avatar/maps/VRMHumanBoneList'

export const MotionCaptureRigComponent = defineComponent({
  name: 'MotionCaptureRigComponent',

  schema: S.Object({
    prevWorldLandmarks: S.Array(S.Object({ x: S.Number(), y: S.Number(), z: S.Number(), visibility: S.Number() })),
    prevScreenLandmarks: S.Array(S.Object({ x: S.Number(), y: S.Number(), z: S.Number(), visibility: S.Number() }))
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
