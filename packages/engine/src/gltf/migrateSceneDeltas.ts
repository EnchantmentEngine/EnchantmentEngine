import { GLTF } from '@gltf-transform/core'
import { Component, Entity, EntityID, EntityUUID, SerializedComponentType } from '@ir-engine/ecs'
import { Patch } from 'rfc6902'
import { OVERRIDE_EXTENSION_NAME } from './overrideExporterExtension'

const SCENE_DELTA_EXTENSION_NAME = 'IR_scene_delta'
const MATERIAL_JSON_ID = 'materialParameters' as const

export type SceneDeltaRegistry = Record<EntityUUID, SceneDeltaEntry<any>>
export type SceneDeltaEntry<C extends Component> = Record<EntityID, Record<string, Partial<SerializedComponentType<C>>>>
export type MaterialDeltaEntry = Record<typeof MATERIAL_JSON_ID, any>

export const migrateSceneDeltas = (entity: Entity, gltf: GLTF.IGLTF) => {
  if (!gltf.extensions) return
  const deltas = gltf.extensions?.[SCENE_DELTA_EXTENSION_NAME] as SceneDeltaRegistry
  if (!deltas) return

  // migrate to override data format
  const overrideData = {} as Record<EntityUUID, Patch>
  for (const [uuid, nodeDeltas] of Object.entries(deltas)) {
    overrideData[uuid] = []
    for (const [nodeID, componentDeltas] of Object.entries(nodeDeltas)) {
      // for (const [componentID, delta] of Object.entries(componentDeltas)) {
      const generatePatchForObject = (path: string, key: string, value: any) => {
        // we need an add here for if the object is not present in the authoring state
        // add will fail gracefully if the value does already exist, so we just overwrite whatever is there with our partial
        // this is an inherent limitation, and should have minimal impact
        for (const [subKey, subValue] of Object.entries(value)) {
          if (typeof subValue === 'object') {
            overrideData[uuid].push({
              op: 'add',
              path: `${path}/${key}/${subKey}`,
              value: 'MIGRATE_SYMBOL' // we don't care about the value here, it's just a placeholder
            })
            generatePatchForObject(`${path}/${key}`, subKey, subValue)
            continue
          }
          overrideData[uuid].push({
            op: 'add', // we want either replace or add here, but it might throw in either case
            path: `${path}/${key}/${subKey}`,
            value: subValue
          })
        }
      }

      generatePatchForObject(``, nodeID, componentDeltas)
    }
  }

  gltf.extensions[OVERRIDE_EXTENSION_NAME] = overrideData
  delete gltf.extensions[SCENE_DELTA_EXTENSION_NAME]
}
