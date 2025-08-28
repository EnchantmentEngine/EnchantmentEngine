
import {
  AnimationSystemGroup,
  createEntity,
  defineQuery,
  defineSystem,
  EntityTreeComponent,
  getComponent,
  setComponent
} from '@ir-engine/ecs'
import { GeometryTypeEnum, GLTFComponent, PrimitiveGeometryComponent } from '@ir-engine/engine'
import { NameComponent, TransformComponent, VisibleComponent } from '@ir-engine/spatial'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { Color, MathUtils, MeshStandardMaterial, Vector3 } from 'three'

const gltf = defineQuery([GLTFComponent])()[0]

const waterColor = new Color('skyblue')
const buoyancyConstant = 9.8 // Buoyancy force constant (like gravity but upwards)
const waterSurfaceY = 0.5 // Y level of the water surface
const floaterMass = 1 // Mass of the floater
const dampingFactor = 0.05 // To reduce oscillations
let boatVelocityY = 0 // Vertical velocity of the boat

let time = 0 // Time accumulator for the bobbing effect
const bobbingAmplitude = 0.1 // Amplitude of the bobbing effect
const bobbingSpeed = 0.02 // Speed of the bobbing effect
const smoothingFactor = 0.01 // How quickly the boat reaches the target position (lower values mean smoother, slower motion)
let targetY = 0 // Target Y position that includes both buoyancy and bobbing effects

const generateWater = () => {
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: gltf })
  setComponent(entity, NameComponent, `water`)
  setComponent(entity, VisibleComponent)
  setComponent(entity, TransformComponent, {
    position: new Vector3(0, -3, 0),
    scale: new Vector3(10, 7, 10)
  })
  setComponent(entity, PrimitiveGeometryComponent, { geometryType: GeometryTypeEnum.BoxGeometry })
  setComponent(entity, MaterialStateComponent, { material: new MeshStandardMaterial({ color: waterColor }) })

  return entity
}

const generateFloater = () => {
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: gltf })
  setComponent(entity, NameComponent, `boat`)
  setComponent(entity, VisibleComponent)
  setComponent(entity, TransformComponent, {
    position: new Vector3(0, 1, 0)
  })
  setComponent(entity, PrimitiveGeometryComponent, { geometryType: GeometryTypeEnum.BoxGeometry })
  return entity
}

generateWater() // Create water entity
const boat = generateFloater()

const execute = () => {
  const boatTransform = getComponent(boat, TransformComponent)
  const boatPosition = boatTransform.position

  const submersionDepth = waterSurfaceY - boatPosition.y

  if (submersionDepth > 0) {
    const buoyancyForce = buoyancyConstant * submersionDepth * floaterMass

    const damping = boatVelocityY * dampingFactor

    boatVelocityY += (buoyancyForce - damping) / floaterMass
  } else {
    boatVelocityY -= buoyancyConstant * 0.1 // Adjust gravity effect if needed
  }

  targetY = boatPosition.y + boatVelocityY

  if (targetY < waterSurfaceY) {
    targetY = waterSurfaceY
    boatVelocityY = 0
  }

  time += bobbingSpeed
  const bobbingOffset = Math.sin(time) * bobbingAmplitude

  targetY += bobbingOffset

  const smoothedY = MathUtils.lerp(boatPosition.y, targetY, smoothingFactor)

  setComponent(boat, TransformComponent, {
    position: new Vector3(boatPosition.x, smoothedY, boatPosition.z)
  })
}

export const waterBouySystem = defineSystem({
  uuid: 'ee.editor.waterBouySystem',
  insert: { before: AnimationSystemGroup },
  execute
})
