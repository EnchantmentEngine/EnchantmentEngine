import { useHookstate } from '@hookstate/core'
import {
  Easing,
  Entity,
  EntityTreeComponent,
  UndefinedEntity,
  createEntity,
  getMutableComponent,
  removeEntity,
  setComponent,
  useComponent
} from '@ir-engine/ecs'
import { HemisphereLightComponent } from '@ir-engine/spatial'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { LineSegmentComponent } from '@ir-engine/spatial/src/renderer/components/LineSegmentComponent'
import { useEffect } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { BOUNDING_BOX_COLORS } from '../../../../spatial/src/transform/components/BoundingBoxComponent'
import { iconGizmoTransitionTimeout } from '../../constants/GizmoPresets'

function createHemisphereDomeGeometry(size: number = 10): BufferGeometry {
  const positions: number[] = []
  const segments = 16
  const rings = 8

  for (let ring = 0; ring <= rings; ring++) {
    const phi = ((ring / rings) * Math.PI) / 2 // 0 to PI/2 for hemisphere
    const radius = Math.sin(phi) * size
    const y = Math.cos(phi) * size

    if (ring < rings) {
      for (let seg = 0; seg < segments; seg++) {
        const theta1 = (seg / segments) * Math.PI * 2
        const theta2 = ((seg + 1) / segments) * Math.PI * 2

        const x1 = Math.cos(theta1) * radius
        const z1 = Math.sin(theta1) * radius
        const x2 = Math.cos(theta2) * radius
        const z2 = Math.sin(theta2) * radius

        positions.push(x1, y, z1, x2, y, z2)
      }
    }

    if (ring > 0 && ring % 2 === 0) {
      for (let seg = 0; seg < segments; seg += 4) {
        const theta = (seg / segments) * Math.PI * 2
        const prevPhi = (((ring - 2) / rings) * Math.PI) / 2
        const prevRadius = Math.sin(prevPhi) * size
        const prevY = Math.cos(prevPhi) * size

        const x = Math.cos(theta) * radius
        const z = Math.sin(theta) * radius
        const prevX = Math.cos(theta) * prevRadius
        const prevZ = Math.sin(theta) * prevRadius

        positions.push(prevX, prevY, prevZ, x, y, z)
      }
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createCenterIndicatorGeometry(size: number = 10): BufferGeometry {
  const positions: number[] = []
  const indicatorSize = size * 0.1

  positions.push(-indicatorSize, 0, 0, indicatorSize, 0, 0)
  positions.push(0, 0, -indicatorSize, 0, 0, indicatorSize)

  positions.push(0, 0, 0, 0, size, 0)

  const topCircleSegments = 8
  const topCircleRadius = size * 0.05
  for (let i = 0; i < topCircleSegments; i++) {
    const angle1 = (i / topCircleSegments) * Math.PI * 2
    const angle2 = ((i + 1) / topCircleSegments) * Math.PI * 2

    const x1 = Math.cos(angle1) * topCircleRadius
    const z1 = Math.sin(angle1) * topCircleRadius
    const x2 = Math.cos(angle2) * topCircleRadius
    const z2 = Math.sin(angle2) * topCircleRadius

    positions.push(x1, size, z1, x2, size, z2)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createHemisphereLightGizmoGeometry(size: number = 10): BufferGeometry {
  const domeGeometry = createHemisphereDomeGeometry(size)
  const centerGeometry = createCenterIndicatorGeometry(size)

  const mergedGeometry = mergeBufferGeometries([domeGeometry, centerGeometry])

  domeGeometry.dispose()
  centerGeometry.dispose()

  return mergedGeometry!
}

export const HemiSphereLightHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const hemisphereLightComponent = useComponent(parentEntity, HemisphereLightComponent)
  const hemisphereLightHelperEntity = useHookstate<Entity>(UndefinedEntity)

  useEffect(() => {
    if (!(selected || hovered)) return

    const helperEntity = createEntity()
    setComponent(helperEntity, EntityTreeComponent, { parentEntity })

    const gizmoGeometry = createHemisphereLightGizmoGeometry(10)

    setComponent(helperEntity, LineSegmentComponent, {
      name: 'hemisphere-light-helper',
      geometry: gizmoGeometry?.clone(),
      color: hemisphereLightComponent.skyColor,
      opacity: 0
    })

    // @ts-ignore causes issues with the type system value inferred as never
    LineSegmentComponent.setTransition(helperEntity, 'opacity', 1, {
      duration: iconGizmoTransitionTimeout,
      easing: Easing.quadratic.inOut
    })

    hemisphereLightHelperEntity.set(helperEntity)

    return () => {
      // @ts-ignore causes issues with the type system value inferred as never
      LineSegmentComponent.setTransition(helperEntity, 'opacity', 0, {
        duration: iconGizmoTransitionTimeout,
        easing: Easing.quadratic.inOut
      })

      setTimeout(() => {
        removeEntity(helperEntity)
        hemisphereLightHelperEntity.set(UndefinedEntity)
      }, iconGizmoTransitionTimeout)
    }
  }, [selected, hovered])

  useEffect(() => {
    if (hemisphereLightHelperEntity.value === UndefinedEntity) return

    const helper = getMutableComponent(hemisphereLightHelperEntity.value, LineSegmentComponent)
    if (!helper) return

    helper.color = hovered ? BOUNDING_BOX_COLORS.HOVERED : hemisphereLightComponent.skyColor
  }, [
    hemisphereLightHelperEntity,
    hemisphereLightComponent.skyColor,
    hemisphereLightComponent.groundColor,
    hemisphereLightComponent.intensity,
    hovered
  ])

  return null
}
