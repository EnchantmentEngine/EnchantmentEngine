import { useHookstate } from '@hookstate/core'
import {
  createEntity,
  Easing,
  Entity,
  EntityTreeComponent,
  hasComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent
} from '@ir-engine/ecs'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { LineSegmentComponent } from '@ir-engine/spatial/src/renderer/components/LineSegmentComponent'
import { DirectionalLightComponent } from '@ir-engine/spatial/src/SpatialModule'
import { BOUNDING_BOX_COLORS } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { iconGizmoTransitionTimeout } from '../../constants/GizmoPresets'

const size = 3
const lightPlaneGeometry = new BufferGeometry()
lightPlaneGeometry.setAttribute(
  'position',
  new Float32BufferAttribute(
    [
      -size,
      size,
      0,
      size,
      size,
      0,
      size,
      size,
      0,
      size,
      -size,
      0,
      size,
      -size,
      0,
      -size,
      -size,
      0,
      -size,
      -size,
      0,
      -size,
      size,
      0,
      -size,
      size,
      0,
      size,
      -size,
      0,
      size,
      size,
      0,
      -size,
      -size,
      0
    ],
    3
  )
)

const targetLineGeometry = new BufferGeometry()
const t = size * 0.1
targetLineGeometry.setAttribute(
  'position',
  new Float32BufferAttribute([-t, t, 0, 0, 0, 1, t, t, 0, 0, 0, 1, t, -t, 0, 0, 0, 1, -t, -t, 0, 0, 0, 1], 3)
)

const mergedGeometry = mergeBufferGeometries([targetLineGeometry, lightPlaneGeometry])

export const DirectionalLightHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const directionalLight = useComponent(parentEntity, DirectionalLightComponent)
  const directionalLightHelperEntity = useHookstate<Entity>(UndefinedEntity)
  useEffect(() => {
    if (!(selected || hovered)) return

    const helperEntity = createEntity()
    setComponent(helperEntity, EntityTreeComponent, { parentEntity })
    setComponent(helperEntity, LineSegmentComponent, {
      name: 'directional-light-helper',
      geometry: mergedGeometry?.clone(),
      color: directionalLight.color,
      opacity: 0
    })
    // @ts-ignore causes issues with the type system value inferred as never

    LineSegmentComponent.setTransition(helperEntity, 'opacity', 1, {
      duration: iconGizmoTransitionTimeout,
      easing: Easing.quadratic.inOut
    })

    directionalLightHelperEntity.set(helperEntity)

    return () => {
      // @ts-ignore causes issues with the type system value inferred as never

      LineSegmentComponent.setTransition(helperEntity, 'opacity', 0, {
        duration: iconGizmoTransitionTimeout,
        easing: Easing.quadratic.inOut
      })

      // Delay removal until after fade-out completes
      setTimeout(() => {
        removeEntity(helperEntity)
        directionalLightHelperEntity.set(UndefinedEntity)
      }, iconGizmoTransitionTimeout)
    }
  }, [selected, hovered])

  useEffect(() => {
    if (directionalLightHelperEntity.value === UndefinedEntity) return
    if (!hasComponent(directionalLightHelperEntity.value, LineSegmentComponent)) return
    setComponent(directionalLightHelperEntity.value, LineSegmentComponent, {
      geometry: mergedGeometry!,
      color: hovered ? BOUNDING_BOX_COLORS.HOVERED : directionalLight.color
    })
  }, [directionalLightHelperEntity, directionalLight.color, hovered])

  return null
}
