import {
  defineComponent,
  EntityUUID,
  getAncestorWithComponents,
  getChildrenWithComponents,
  getComponent,
  getOptionalComponent,
  LayerFunctions,
  removeEntityNodeRecursively,
  setComponent,
  useAncestorWithComponents,
  useComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { Box3, Vector3 } from 'three'
import { GLTFComponent } from '../gltf/GLTFComponent'
import { AssetState } from '../gltf/GLTFState'

export const LightmapComponent = defineComponent({
  name: 'LightmapComponent',
  jsonID: 'IR_lightmap',

  schema: S.Object({
    atlasSrc: S.String({ default: '' })
  }),

  reactor: ({ entity }) => {
    const lightmapComponent = useComponent(entity, LightmapComponent)

    useEffect(() => {
      setComponent(entity, BoundingBoxComponent, {
        box: new Box3(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5))
      })
    }, [])

    const sceneEntity = useAncestorWithComponents(entity, [SceneComponent])
    const sceneLoaded = GLTFComponent.useSceneLoaded(LayerFunctions.getAuthoringCounterpart(sceneEntity) || sceneEntity)

    useEffect(() => {
      if (!lightmapComponent.atlasSrc.value) return

      AssetState.loadAsync(lightmapComponent.atlasSrc.value, false, UUIDComponent.generate()).then((atlasEntity) => {
        const sceneUUID = UUIDComponent.get(getAncestorWithComponents(entity, [SceneComponent]))
        for (const atlasedChildEntity of getChildrenWithComponents(atlasEntity, [MeshComponent])) {
          const correspondingEntity = UUIDComponent.getEntityByUUID(
            (sceneUUID + getComponent(atlasedChildEntity, UUIDComponent).entityID) as EntityUUID
          )
          const atlasedMeshComponent = getComponent(atlasedChildEntity, MeshComponent)
          if (!correspondingEntity) continue
          const correspondingMeshComponent = getOptionalComponent(correspondingEntity, MeshComponent)
          if (!correspondingMeshComponent) continue
          //transfer all attributes from atlas to corresponding mesh
          for (const attributeName in atlasedMeshComponent.geometry.attributes) {
            correspondingMeshComponent.geometry.setAttribute(
              attributeName,
              atlasedMeshComponent.geometry.getAttribute(attributeName)
            )
          }
          correspondingMeshComponent.geometry.index = atlasedMeshComponent.geometry.index
        }
        removeEntityNodeRecursively(atlasEntity)
      })
    }, [sceneLoaded])

    return null
  }
})
