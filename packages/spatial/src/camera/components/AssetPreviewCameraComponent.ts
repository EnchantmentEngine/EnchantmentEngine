import { defineComponent, EntitySchema, useComponent, useEntityContext, useQueryBySource } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { computeTransformPivot } from '../../common/functions/TransformPivot'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { CameraOrbitComponent } from './CameraOrbitComponent'

export const AssetPreviewCameraComponent = defineComponent({
  name: 'AssetPreviewCameraComponent',

  schema: Schema.Object({
    targetModelEntity: EntitySchema.Entity()
  }),

  reactor: () => {
    const entity = useEntityContext()
    const previewCameraComponent = useComponent(entity, AssetPreviewCameraComponent)
    const childMeshEntities = useQueryBySource(previewCameraComponent.targetModelEntity, [MeshComponent])
    const cameraOrbitComponent = useComponent(entity, CameraOrbitComponent)

    useEffect(() => {
      const pivot = computeTransformPivot(childMeshEntities)
      if (cameraOrbitComponent && pivot.position) {
        CameraOrbitComponent.setFocus(entity, pivot.position, pivot.bounds)
      }
    }, [JSON.stringify(childMeshEntities), !!cameraOrbitComponent])

    return null
  }
})
