import {
  defineComponent,
  defineQuery,
  Entity,
  getComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  useQuery
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineState, getState, OpaqueType, useImmediateEffect } from '@ir-engine/hyperflux'
import { T } from '../../schema/schemaFunctions'

/**
 * @description
 * Type alias for CameraPointer hashes.
 * Strings of this type Hash should be created with `InputPointerState.createCameraPointerHash(entity, pointerID)` */
export type CameraPointerHash = OpaqueType<'CameraPointerHash'> & string

export const InputPointerState = defineState({
  name: 'InputPointerState',
  initial() {
    return {
      pointers: new Map<CameraPointerHash, Entity>()
    }
  },

  /**
   * @description
   *  Creates a string ID (aka hash) for the given `@param camera` and `@param pointer`,
   *  with the format expected by the Keys of  `InputPointerState.pointers` Map.
   * @warning Remember to call `.value` before sending the data into this function if you are getting them from a Component. */
  createCameraPointerHash(camera: Entity, pointer: number): CameraPointerHash {
    return `canvas-${camera}.pointer-${pointer}` as CameraPointerHash
  }
})

export const InputPointerComponent = defineComponent({
  name: 'InputPointerComponent',

  schema: S.Object({
    pointerId: S.Number({ default: -1 }),
    position: T.Vec2(),
    lastPosition: T.Vec2(),
    movement: T.Vec2(),
    cameraEntity: S.Entity()
  }),

  reactor: () => {
    const entity = useEntityContext()
    const inputPointerComponent = useComponent(entity, InputPointerComponent)

    useImmediateEffect(() => {
      const pointerId = inputPointerComponent.pointerId
      const cameraEntity = inputPointerComponent.cameraEntity
      const pointerHash = InputPointerState.createCameraPointerHash(cameraEntity, pointerId)

      getState(InputPointerState).pointers.set(pointerHash, entity)
      return () => {
        getState(InputPointerState).pointers.delete(pointerHash)
      }
    }, [inputPointerComponent.pointerId, inputPointerComponent.cameraEntity])

    return null
  },

  getPointersForCamera(cameraEntity: Entity) {
    return pointerQuery().filter((entity) => getComponent(entity, InputPointerComponent).cameraEntity === cameraEntity)
  },

  usePointersForCamera(cameraEntity: Entity) {
    const pointers = useQuery([InputPointerComponent])
    return pointers.filter((entity) => getComponent(entity, InputPointerComponent)?.cameraEntity === cameraEntity)
  },

  getPointerByID(cameraEntity: Entity, pointerId: number) {
    const pointerHash = InputPointerState.createCameraPointerHash(cameraEntity, pointerId)
    return getState(InputPointerState).pointers.get(pointerHash) ?? UndefinedEntity
  }
})

const pointerQuery = defineQuery([InputPointerComponent])
