/**
 * Sample data
    "IR_scene_delta": {
      "b46b57c1-bd37-43cc-b000-8b4411fe728b": {
        "material-1": {
          "IR_material_lava": {},
          "IR_material": {
            "parameters.color": 13633287
          }
        },
        "material-2": {
          "IR_material": {
            "parameters.color": 396556
          }
        },
        "material-3": {
          "IR_material": {
            "parameters.color": 10966614
          }
        }
      }
    }
  */

/**
 * Expected output data
 * 

"IR_override": {
  "b46b57c1-bd37-43cc-b000-8b4411fe728b": [
    {
      "op": "add",
      "path": "/material-1/IR_material_lava",
      "value": {}
    },
    {
      "op": "add",
      "path": "/material-1/IR_material/parameters.color",
      "value": 13633287
    },
    {
      "op": "add",
      "path": "/material-2/IR_material/parameters.color",
      "value": 396556
    },
    {
      "op": "add",
      "path": "/material-3/IR_material/parameters.color",
      "value": 10966614
    }
  ]
}
 */

import { GLTF } from '@gltf-transform/core'
import { Component, Entity, EntityUUID, SerializedComponentType } from '@ir-engine/ecs'
import { Patch } from 'rfc6902'
import { NodeID } from './NodeIDComponent'
import { OVERRIDE_EXTENSION_NAME } from './SceneDeltaExporterExtension'

const SCENE_DELTA_EXTENSION_NAME = 'IR_scene_delta'
const MATERIAL_JSON_ID = 'materialParameters' as const
const MATERIAL_PROTOTYPE_JSON_ID = 'prototypeConstructor' as const

export type SceneDeltaRegistry = Record<EntityUUID, SceneDeltaEntry<any>>
export type SceneDeltaEntry<C extends Component> = Record<NodeID, Record<string, Partial<SerializedComponentType<C>>>>
export type MaterialDeltaEntry = Record<typeof MATERIAL_JSON_ID, any>

export const migrateSceneDeltas = (entity: Entity, gltf: GLTF.IGLTF) => {
  if (!gltf.extensions) return
  const deltas = gltf.extensions?.[SCENE_DELTA_EXTENSION_NAME] as SceneDeltaRegistry
  if (deltas) {
    // migrate to override data format
    const overrideData = {} as Record<EntityUUID, Patch>
    for (const [uuid, nodeDeltas] of Object.entries(deltas)) {
      overrideData[uuid] = []
      for (const [nodeID, componentDeltas] of Object.entries(nodeDeltas)) {
        for (const [componentID, delta] of Object.entries(componentDeltas)) {
          if (Object.keys(delta).length === 0) {
            overrideData[uuid].push({
              op: 'add',
              path: `/${nodeID}/${componentID}`,
              value: {}
            })
            continue
          }
          for (const [key, value] of Object.entries(delta)) {
            overrideData[uuid].push({
              op: 'replace', // we want either replace or add here, but it might throw in either case
              path: `/${nodeID}/${componentID}/${key}`,
              value: value
            })
          }
        }
      }
    }
    gltf.extensions[OVERRIDE_EXTENSION_NAME] = overrideData
    delete gltf.extensions[SCENE_DELTA_EXTENSION_NAME]
  }
}
