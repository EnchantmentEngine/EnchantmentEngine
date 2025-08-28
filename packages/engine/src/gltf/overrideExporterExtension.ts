import { hasComponent, iterateEntityNode, UUIDComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { cleanStorageProviderURLs } from '@ir-engine/spatial/src/resources/parseSceneJSON'
import { AuthoringState } from '../authoring/AuthoringState'
import { GLTFSceneExportExtension } from './exportGLTFScene'

export const OVERRIDE_EXTENSION_NAME = 'IR_override'

export const overrideExporterExtension: () => GLTFSceneExportExtension = () => ({
  after: (rootEntity, gltf) => {
    const overrideState = getState(AuthoringState)
    let usedSceneDelta = false
    if (!hasComponent(rootEntity, UUIDComponent)) return
    const rootUUID = UUIDComponent.get(rootEntity)
    iterateEntityNode(rootEntity, (entity) => {
      if (entity === rootEntity) return
      if (!hasComponent(entity, UUIDComponent)) return
      const uuid = UUIDComponent.getAsSourceID(entity)
      if (!overrideState.sources[uuid]) return
      const nodeDelta = AuthoringState.getAllCommands(uuid)
      if (!nodeDelta.length) return
      gltf.extensions ??= {}
      const extensions: Record<string, any> = gltf.extensions
      extensions[OVERRIDE_EXTENSION_NAME] ??= {}
      const extension = extensions[OVERRIDE_EXTENSION_NAME]
      const relativeUUID = uuid.replace(rootUUID, '')
      extension[relativeUUID] ??= {}
      extension[relativeUUID] = nodeDelta
      usedSceneDelta = true
    })
    if (usedSceneDelta) {
      cleanStorageProviderURLs(gltf.extensions![OVERRIDE_EXTENSION_NAME])
      gltf.extensionsUsed ??= []
      gltf.extensionsUsed.push(OVERRIDE_EXTENSION_NAME)
    }
  }
})
