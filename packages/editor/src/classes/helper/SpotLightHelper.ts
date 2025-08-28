import { useHookstate } from '@hookstate/core'
import {
  Easing,
  Entity,
  EntityTreeComponent,
  UndefinedEntity,
  createEntity,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent,
  useComponent
} from '@ir-engine/ecs'
import { SpotLightComponent } from '@ir-engine/spatial'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { LineSegmentComponent } from '@ir-engine/spatial/src/renderer/components/LineSegmentComponent'
import { BOUNDING_BOX_COLORS } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { iconGizmoTransitionTimeout } from '../../constants/GizmoPresets'

function createSpotLightConeGeometry(angle: number, range: number): BufferGeometry {
  const segments = 16
  const positions: number[] = []

  const visualRange = range === 0 ? 10 : range
  const radius = Math.tan(angle) * visualRange

  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * Math.PI * 2
    const angle2 = ((i + 1) / segments) * Math.PI * 2

    const x1 = Math.cos(angle1) * radius
    const y1 = Math.sin(angle1) * radius
    const x2 = Math.cos(angle2) * radius
    const y2 = Math.sin(angle2) * radius

    positions.push(x1, y1, visualRange)
    positions.push(x2, y2, visualRange)
  }

  for (let i = 0; i < segments; i += 4) {
    const lineAngle = (i / segments) * Math.PI * 2
    const x = Math.cos(lineAngle) * radius
    const y = Math.sin(lineAngle) * radius

    positions.push(0, 0, 0)
    positions.push(x, y, visualRange)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createSpotLightRadialGeometry(angle: number, range: number): BufferGeometry {
  const positions: number[] = []

  const visualRange = range === 0 ? 10 : range
  const radius = Math.tan(angle) * visualRange

  const numLines = 16
  for (let i = 0; i < numLines; i++) {
    const lineAngle = (i / numLines) * Math.PI * 2
    const x = Math.cos(lineAngle) * radius
    const y = Math.sin(lineAngle) * radius

    positions.push(0, 0, 0)
    positions.push(x, y, visualRange)
  }

  const halfRange = visualRange * 0.5
  const halfRadius = Math.tan(angle) * halfRange
  for (let i = 0; i < 8; i++) {
    const lineAngle = (i / 8) * Math.PI * 2
    const x = Math.cos(lineAngle) * halfRadius
    const y = Math.sin(lineAngle) * halfRadius

    positions.push(0, 0, 0)
    positions.push(x, y, halfRange)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createSpotLightGizmoGeometry(angle: number, range: number): BufferGeometry {
  const coneGeometry = createSpotLightConeGeometry(angle, range)
  const radialGeometry = createSpotLightRadialGeometry(angle, range)

  const mergedGeometry = mergeBufferGeometries([coneGeometry, radialGeometry])

  coneGeometry.dispose()
  radialGeometry.dispose()

  return mergedGeometry!
}

export const SpotLightHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const spotLightComponent = useComponent(parentEntity, SpotLightComponent)
  const spotLightHelperEntity = useHookstate<Entity>(UndefinedEntity)

  useEffect(() => {
    if (!(selected || hovered)) return

    const helperEntity = createEntity()
    setComponent(helperEntity, EntityTreeComponent, { parentEntity })

    const gizmoGeometry = createSpotLightGizmoGeometry(spotLightComponent.angle, spotLightComponent.range)

    setComponent(helperEntity, LineSegmentComponent, {
      name: 'spot-light-helper',
      geometry: gizmoGeometry?.clone(),
      color: spotLightComponent.color,
      opacity: 0
    })

    spotLightHelperEntity.set(helperEntity)

    // @ts-ignore causes issues with the type system value inferred as never
    LineSegmentComponent.setTransition(helperEntity, 'opacity', 1, {
      duration: iconGizmoTransitionTimeout,
      easing: Easing.quadratic.inOut
    })

    return () => {
      // @ts-ignore causes issues with the type system value inferred as never
      LineSegmentComponent.setTransition(helperEntity, 'opacity', 0, {
        duration: iconGizmoTransitionTimeout,
        easing: Easing.quadratic.inOut
      })

      setTimeout(() => {
        removeEntity(helperEntity)
        spotLightHelperEntity.set(UndefinedEntity)
      }, iconGizmoTransitionTimeout)
    }
  }, [selected, hovered])

  useEffect(() => {
    if (spotLightHelperEntity.value === UndefinedEntity) return

    if (!hasComponent(spotLightHelperEntity.value, LineSegmentComponent)) return

    const oldGeometry = getComponent(spotLightHelperEntity.value, LineSegmentComponent).geometry
    if (oldGeometry) {
      oldGeometry.dispose()
    }
    setComponent(spotLightHelperEntity.value, LineSegmentComponent, {
      color: hovered ? BOUNDING_BOX_COLORS.HOVERED : spotLightComponent.color
    })

    const newGeometry = createSpotLightGizmoGeometry(spotLightComponent.angle, spotLightComponent.range)

    if (oldGeometry) {
      oldGeometry.dispose()
    }
    setComponent(spotLightHelperEntity.value, LineSegmentComponent, { geometry: newGeometry })
  }, [spotLightHelperEntity, spotLightComponent.color, spotLightComponent.angle, spotLightComponent.range, hovered])

  return null
}
