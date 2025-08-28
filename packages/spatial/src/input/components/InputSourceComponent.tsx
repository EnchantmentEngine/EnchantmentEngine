import { Raycaster } from 'three'

import { defineQuery } from '@ir-engine/ecs'
import { defineComponent, getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'

import { EntitySchema } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { isTouchAvailable } from '../../common/functions/DetectFeatures'
import { XRHandComponent, XRSpaceComponent } from '../../xr/XRComponents'
import { ReferenceSpace, XRState } from '../../xr/XRState'
import { ButtonStateMap } from '../state/ButtonState'
import { InputState } from '../state/InputState'
import { DefaultButtonBindings } from './InputComponent'

export const InputSourceComponent = defineComponent({
  name: 'InputSourceComponent',

  schema: Schema.Object({
    sourceEntity: EntitySchema.Entity(),
    source: Schema.Type<XRInputSource>({ default: {} as XRInputSource }),
    buttons: Schema.Type<Readonly<ButtonStateMap<typeof DefaultButtonBindings>>>({ default: {} }),
    raycaster: Schema.Class(() => new Raycaster()),
    intersections: Schema.Array(
      Schema.Object({
        entity: EntitySchema.Entity(),
        distance: Schema.Number()
      })
    )
  }),

  onSet: (
    entity,
    component,
    args: { sourceEntity?: Entity; buttons?: ButtonStateMap<any>; source?: XRInputSource; gamepad?: Gamepad } = {}
  ) => {
    const source =
      args.source ??
      ({
        handedness: 'none',
        targetRayMode: 'screen',
        targetRaySpace: {} as XRSpace,
        gripSpace: undefined,
        gamepad:
          args.gamepad ??
          ({
            axes: [0, 0, 0, 0],
            buttons: [],
            connected: true,
            hapticActuators: [],
            id: 'emulated-gamepad-' + entity,
            index: 0,
            mapping: isTouchAvailable ? 'xr-standard' : '',
            timestamp: performance.now(),
            vibrationActuator: null
          } as unknown as Gamepad),
        profiles: [],
        hand: undefined
      } as XRInputSource)

    component.source = source

    // if we have a real input source, we should add the XRSpaceComponent
    if (args.source?.targetRaySpace) {
      InputSourceComponent.entitiesByInputSource.set(args.source, entity)
      const space = args.source.targetRaySpace
      const baseSpace =
        args.source.targetRayMode === 'tracked-pointer' ? ReferenceSpace.localFloor : ReferenceSpace.viewer
      if (!baseSpace) throw new Error('Base space not found')
      setComponent(entity, XRSpaceComponent, { space, baseSpace })
    }

    if (source.hand) {
      setComponent(entity, XRHandComponent)
    }

    if (args.buttons) {
      component.buttons = args.buttons
    }

    if (typeof args.sourceEntity === 'number') {
      component.sourceEntity = args.sourceEntity
    }
  },

  nonCapturedInputSources(entities = inputSourceQuery()) {
    return entities.filter((eid) => eid !== getState(InputState).capturingEntity)
  },

  /**
   * Gets the preferred controller entity - will return null if the entity is not in an active session or the controller is not available
   * @param {boolean} offhand specifies to return the non-preferred hand instead
   * @returns {Entity}
   */
  getPreferredInputSource: (offhand = false) => {
    const xrState = getState(XRState)
    if (!xrState.sessionActive) return
    const avatarInputSettings = getState(InputState)
    for (const inputSourceEntity of inputSourceQuery()) {
      const inputSourceComponent = getComponent(inputSourceEntity, InputSourceComponent)
      const source = inputSourceComponent.source
      if (source?.handedness === 'none') continue
      if (!offhand && avatarInputSettings.preferredHand == source?.handedness) return source
      if (offhand && avatarInputSettings.preferredHand !== source?.handedness) return source
    }
  },

  getClosestIntersectedEntity(inputSourceEntity: Entity) {
    return getComponent(inputSourceEntity, InputSourceComponent).intersections[0]?.entity
  },

  getClosestIntersection(inputSourceEntity: Entity) {
    return getComponent(inputSourceEntity, InputSourceComponent).intersections[0]
  },

  entitiesByInputSource: new WeakMap<XRInputSource, Entity>()
})

const inputSourceQuery = defineQuery([InputSourceComponent])

/**
 * Scenario:
 * - hover over object shows UI hint
 * - click for object triggers action
 * - click and drag on object moves it around
 * - click and drag on some surfaces rotates the camera
 *
 *
 *
 *
 * Questions
 * - Can we have implicit ordering of input receiver systems? Or does it need to be explicit or non-ordered / deterministic?
 * -
 *
 */
