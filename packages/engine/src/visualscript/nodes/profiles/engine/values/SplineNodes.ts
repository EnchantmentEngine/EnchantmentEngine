import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityID } from '@ir-engine/ecs/src/Entity'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { SystemUUID, defineSystem, destroySystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { SplineComponent } from '@ir-engine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@ir-engine/engine/src/scene/components/SplineTrackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Assert, NodeCategory, makeAsyncNodeDefinition, makeFunctionNodeDefinition } from '@ir-engine/visual-script'

const splineQuery = defineQuery([SplineComponent])

export const getSpline = makeFunctionNodeDefinition({
  typeName: 'engine/spline/getSpline',
  category: NodeCategory.Engine,
  label: 'Get Spline Entity',
  in: {
    spline: (_) => {
      const choices = splineQuery().map((entity) => ({
        text: getComponent(entity, NameComponent),
        value: UUIDComponent.get(entity)
      }))
      choices.unshift({ text: 'none', value: '' as EntityUUID })
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { entity: 'entity' },
  exec: ({ read, write }) => {
    const splineEntityUUID = read<EntityUUID>('spline')
    Assert.mustBeTrue(splineEntityUUID !== '', 'Please select spline entity')
    const splineEntity = UUIDComponent.getEntityByUUID(splineEntityUUID)
    write('entity', splineEntity)
  }
})

let systemCounter = 0
type State = {
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  systemUUID: '' as SystemUUID
})
export const addSplineTrack = makeAsyncNodeDefinition({
  typeName: 'engine/spline/addSplineTrack',
  category: NodeCategory.Engine,
  label: 'Add spline track',
  in: {
    flow: 'flow',
    entity: 'entity',
    velocity: 'float',
    splineUUID: 'string',
    isLoop: 'boolean',
    lockToXZPlane: 'boolean',
    enableRotation: 'boolean',
    reset: 'boolean'
  },
  out: { flow: 'flow', trackEnd: 'flow', entity: 'entity' },
  initialState: initialState(),
  triggered: ({ read, write, commit, finished }) => {
    const entity = Number(read('entity')) as Entity
    const splineUuid = read<EntityID>('splineUUID')
    const velocity = read<number>('velocity')
    const isLoop = read<boolean>('isLoop')
    const lockToXZPlane = read<boolean>('lockToXZPlane')
    const enableRotation = read<boolean>('enableRotation')
    const alpha = read<number>('reset') ? 0 : undefined

    setComponent(entity, SplineTrackComponent, {
      alpha: alpha,
      splineEntityUUID: splineUuid,
      velocity: velocity,
      enableRotation: enableRotation,
      lockToXZPlane: lockToXZPlane,
      loop: isLoop
    })

    write('entity', entity)
    const systemUUID = defineSystem({
      uuid: 'visual-script-spline-tracker-' + systemCounter++,
      insert: { with: PresentationSystemGroup },
      execute: () => {
        // can we hook into the spline track reactor somehow? this feels wasteful, but probably the right way to do it
        const splineTrack = getComponent(entity, SplineTrackComponent)
        if (splineTrack.loop) return
        const splineEntity = UUIDComponent.getEntityFromSameSourceByID(entity, splineTrack.splineEntityUUID!)
        if (!splineEntity) return
        const spline = getOptionalComponent(splineEntity, SplineComponent)
        if (!spline) return
        if (Math.floor(splineTrack.alpha) > spline!.elements.length - 1) {
          commit('trackEnd')
          finished?.()
          destroySystem(systemUUID) // we only want to run it once
          return
        }
      }
    })

    commit('flow')
    const state: State = {
      systemUUID
    }

    return state
  },
  dispose: ({ state: { systemUUID } }) => {
    if (systemUUID) destroySystem(systemUUID) // for if we shut down the vScript early
    return initialState()
  }
})

//scene transition
