import {
  defineSystem,
  Entity,
  getComponent,
  LayerFunctions,
  PresentationSystemGroup,
  removeComponent
} from '@ir-engine/ecs'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent,
  SerializedTexture
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { MeshStandardMaterial, WebGLRenderer } from 'three'
import { commitProperties } from '../components/properties/Util'
import { LightmapBakeComponent } from './LightmapBakeComponent'
import { Lightmapper } from './LightmapperFunctions'

const lightmapQuery = defineQuery([LightmapBakeComponent])

const execute = () => {
  for (const entity of lightmapQuery()) {
    const {
      renderTarget,
      raycastMesh,
      orthographicCamera,
      raycastMaterial,
      entities,
      currentSamples,
      totalSamples,
      channel
    } = getComponent(entity, LightmapBakeComponent)

    if (currentSamples < totalSamples) {
      getComponent(entity, LightmapBakeComponent).currentSamples = Lightmapper.sample(
        raycastMesh,
        renderTarget,
        raycastMaterial,
        orthographicCamera,
        getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer! as WebGLRenderer,
        currentSamples
      )
    } else {
      Lightmapper.uploadLightmapTexture(renderTarget, entity)
        .then((uploadedUrl) => {
          if (uploadedUrl) {
            const materials = [] as Entity[]
            for (const entity of entities) {
              const materialEntities = getComponent(entity, MaterialInstanceComponent).entities
              materials.push(...materialEntities)
            }
            for (const materialEntity of materials) {
              commitProperties(
                MaterialStateComponent,
                {
                  ['parameters.aoMap' as string]: { source: uploadedUrl, channel } as SerializedTexture,
                  ['parameters.aoMapIntensity' as string]: 1
                },
                [LayerFunctions.getAuthoringCounterpart(materialEntity)]
              )
            }
          }
        })
        .catch((error) => {
          console.error('Failed to upload lightmap texture:', error)
        })

      removeComponent(entity, LightmapBakeComponent)
    }

    // inelegant way to preview the progressive render
    // data assigned to material here will be overwritten by AuthoringState when the overrides are applied
    entities.map((entity) => {
      const materialInstanceComponent = getComponent(entity, MaterialInstanceComponent)
      for (const materialEntity of materialInstanceComponent.entities) {
        const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
        material.aoMapIntensity = 1
        material.aoMap = renderTarget.texture
        material.aoMap!.channel = channel
        material.needsUpdate = true
      }
    })
  }
}

export const LightmapSystem = defineSystem({
  uuid: 'ee.engine.LightmapSystem',
  insert: { with: PresentationSystemGroup },
  execute
})
