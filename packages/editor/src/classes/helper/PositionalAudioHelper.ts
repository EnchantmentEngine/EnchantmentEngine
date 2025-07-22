import { useHookstate } from '@hookstate/core'
import {
  createEntity,
  EntityTreeComponent,
  getMutableComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { TransformComponent } from '@ir-engine/spatial'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useEffect } from 'react'
import {
  BufferGeometry,
  ConeGeometry,
  DoubleSide,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Vector2
} from 'three'

function createCone(angleDegrees: number, coneHyp: number) {
  const sgmnts = Math.floor(angleDegrees / 30)
  const capSegments = Math.max(sgmnts, 3)
  const coneSegments = capSegments * 4
  const angleRad = MathUtils.degToRad(angleDegrees)

  const coneOpp = coneHyp * Math.sin(angleRad / 2)
  const coneHeight = Math.sqrt(coneHyp ** 2 - coneOpp ** 2)

  const coneGeometry = new ConeGeometry(coneOpp, coneHeight, coneSegments, 1, true)

  if (angleRad <= Math.PI) coneGeometry.rotateX(Math.PI)

  coneGeometry.translate(0, (angleRad <= Math.PI ? 1 : -1) * (coneHeight / 2), 0)
  coneGeometry.rotateX(Math.PI / 2)
  return coneGeometry
}

function createCap(angleDegrees: number, coneHyp: number) {
  const sgmnts = Math.floor(angleDegrees / 30)
  const capSegments = Math.max(sgmnts, 3)
  const angleRad = MathUtils.degToRad(angleDegrees)
  const coneSegments = capSegments * 4

  const capPoints = [] as Vector2[]
  for (let i = 0; i <= capSegments; i++) {
    const x = Math.sin(((i / capSegments) * angleRad) / 2) * -coneHyp
    const y = Math.cos(((i / capSegments) * angleRad) / 2) * -coneHyp
    capPoints.push(new Vector2(x, y))
  }

  const capGeometry = new LatheGeometry(capPoints, coneSegments)
  capGeometry.rotateX(Math.PI)
  capGeometry.rotateX(Math.PI / 2)
  return capGeometry as BufferGeometry
}

export const PositionalAudioHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props
  const mediaElement = useOptionalComponent(parentEntity, MediaElementComponent)
  const debugEnabled = selected || hovered
  const audioComponent = useComponent(parentEntity, PositionalAudioComponent)
  const helperEntities = useHookstate({
    innerConeEntity: UndefinedEntity,
    innerCapEntity: UndefinedEntity,
    outerConeEntity: UndefinedEntity,
    outerCapEntity: UndefinedEntity
  })

  useEffect(() => {
    if (!debugEnabled) return

    const innerConeEntity = createEntity()
    const innerConeMesh = new Mesh(
      createCone(audioComponent.coneInnerAngle.value, audioComponent.maxDistance.value),
      new MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.4, side: DoubleSide })
    )
    setComponent(innerConeEntity, VisibleComponent)
    setComponent(innerConeEntity, TransformComponent)
    setComponent(innerConeEntity, EntityTreeComponent, { parentEntity })
    setComponent(innerConeEntity, MeshComponent, innerConeMesh)

    const innerCapEntity = createEntity()
    const innerCapMesh = new Mesh(
      createCap(audioComponent.coneInnerAngle.value, audioComponent.maxDistance.value),
      new MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.4, side: DoubleSide })
    )
    setComponent(innerCapEntity, VisibleComponent)
    setComponent(innerCapEntity, TransformComponent)
    setComponent(innerCapEntity, EntityTreeComponent, { parentEntity })
    setComponent(innerCapEntity, MeshComponent, innerCapMesh)

    const outerConeEntity = createEntity()
    const outerConeMesh = new Mesh(
      createCone(audioComponent.coneOuterAngle.value, audioComponent.maxDistance.value),
      new MeshBasicMaterial({ color: 0x000080, wireframe: true, side: DoubleSide })
    )
    setComponent(outerConeEntity, VisibleComponent)
    setComponent(outerConeEntity, TransformComponent)
    setComponent(outerConeEntity, EntityTreeComponent, { parentEntity })
    setComponent(outerConeEntity, MeshComponent, outerConeMesh)

    const outerCapEntity = createEntity()
    const outerCapMesh = new Mesh(
      createCap(audioComponent.coneOuterAngle.value, audioComponent.maxDistance.value),
      new MeshBasicMaterial({ color: 0x000080, wireframe: true, side: DoubleSide })
    )
    setComponent(outerCapEntity, VisibleComponent)
    setComponent(outerCapEntity, TransformComponent)
    setComponent(outerCapEntity, EntityTreeComponent, { parentEntity })
    setComponent(outerCapEntity, MeshComponent, outerCapMesh)

    helperEntities.set({
      innerConeEntity,
      innerCapEntity,
      outerConeEntity,
      outerCapEntity
    })

    return () => {
      removeEntity(helperEntities.innerConeEntity.value)
      removeEntity(helperEntities.innerCapEntity.value)
      removeEntity(helperEntities.outerConeEntity.value)
      removeEntity(helperEntities.outerCapEntity.value)
    }
  }, [debugEnabled, mediaElement?.value.element])

  useEffect(() => {
    const innerConeMesh = getMutableComponent(helperEntities.innerConeEntity.value, MeshComponent)
    const innerCapMesh = getMutableComponent(helperEntities.innerCapEntity.value, MeshComponent)

    if (!innerConeMesh || !innerCapMesh) return
    innerConeMesh.geometry.set(createCone(audioComponent.coneInnerAngle.value, audioComponent.maxDistance.value))
    innerCapMesh.geometry.set(createCap(audioComponent.coneInnerAngle.value, audioComponent.maxDistance.value))
  }, [audioComponent.coneInnerAngle.value, audioComponent.maxDistance.value])

  useEffect(() => {
    const outerConeMesh = getMutableComponent(helperEntities.outerConeEntity.value, MeshComponent)
    const outerCapMesh = getMutableComponent(helperEntities.outerCapEntity.value, MeshComponent)

    if (!outerConeMesh || !outerCapMesh) return

    outerConeMesh.geometry.set(createCone(audioComponent.coneOuterAngle.value, audioComponent.maxDistance.value))
    outerCapMesh.geometry.set(createCap(audioComponent.coneOuterAngle.value, audioComponent.maxDistance.value))
  }, [audioComponent.coneOuterAngle.value, audioComponent.maxDistance.value])

  return null
}
