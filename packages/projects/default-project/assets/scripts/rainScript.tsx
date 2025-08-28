
import {
  createEntity,
  defineQuery,
  Entity,
  EntityTreeComponent,
  getMutableComponent,
  setComponent
} from '@ir-engine/ecs'
import { GLTFComponent, ParticleSystemComponent } from '@ir-engine/engine'
import { NameComponent, TransformComponent, VisibleComponent } from '@ir-engine/spatial'
import { Euler, MathUtils, NormalBlending, Quaternion, Vector3 } from 'three'

const gltf = defineQuery([GLTFComponent])()[0]
const rainTexture = 'https://localhost:8642/projects/ir-engine/default-project/assets/raindrop.png'

const setupParticleSystem = () => {
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: gltf })
  setComponent(entity, VisibleComponent)
  setComponent(entity, ParticleSystemComponent)
  return entity
}

interface RainForce {
  type: string
  direction: number[]
  magnitude: {
    type: string
    value: number
  }
}

const setupRain = (entity: Entity): void => {
  const particleSystem = getMutableComponent(entity, ParticleSystemComponent)
  const particle = particleSystem.value
  particleSystem.systemParameters.duration.set(2)
  particleSystem.systemParameters.shape.set({ type: 'sphere', radius: 1 })
  particleSystem.systemParameters.texture.set(rainTexture)
  particleSystem.systemParameters.transparent.set(true)
  particleSystem.systemParameters.startLife.set({ type: 'ConstantValue', value: 1.1 })
  particleSystem.systemParameters.startSize.set({ type: 'IntervalValue', a: 0.01, b: 0.02 })
  particleSystem.systemParameters.startSpeed.set({ type: 'IntervalValue', a: 0.01, b: 3 })
  particleSystem.systemParameters.startRotation.set({ type: 'ConstantValue', value: 0 })
  particleSystem.systemParameters.startColor.set({ type: 'ConstantColor', color: { r: 0.3, g: 0.5, b: 0.9, a: 0.3 } })
  particleSystem.systemParameters.emissionOverTime.set({ type: 'ConstantValue', value: 1000 })

  const rainForce: RainForce = {
    type: 'ApplyForce',
    direction: [0, -100, 0],
    magnitude: {
      type: 'ConstantValue',
      value: 1
    }
  }
  particleSystem.behaviorParameters.set([...JSON.parse(JSON.stringify(particle.behaviorParameters)), rainForce])
}

const setupCloud = (entity: Entity): void => {
  const particleSystem = getMutableComponent(entity, ParticleSystemComponent)
  particleSystem.systemParameters.shape.set({ type: 'sphere', radius: 1 })
  particleSystem.systemParameters.transparent.set(true)
  particleSystem.systemParameters.startSize.set({ type: 'IntervalValue', a: 0.6, b: 0.01 })
  particleSystem.systemParameters.startColor.set({ type: 'ConstantColor', color: { r: 0.6, g: 0.6, b: 0.6, a: 0.1 } })
  particleSystem.systemParameters.emissionOverTime.set({ type: 'ConstantValue', value: 800 })
  particleSystem.systemParameters.blending.set(NormalBlending)
}

const cloudParticleEntity = setupParticleSystem()
setComponent(cloudParticleEntity, NameComponent, 'cloudParticleObject')
setComponent(cloudParticleEntity, TransformComponent, {
  position: new Vector3(0, 30, 0),
  scale: new Vector3(20, 4, 20)
})
setupCloud(cloudParticleEntity)

const rainParticleSystem = setupParticleSystem()
setComponent(rainParticleSystem, NameComponent, 'rainParticleObject')
setComponent(rainParticleSystem, TransformComponent, {
  position: new Vector3(0, 30, 0),
  rotation: new Quaternion().setFromEuler(new Euler(MathUtils.DEG2RAD * 90, 0, 0)),
  scale: new Vector3(20, 20, 1)
})
setupRain(rainParticleSystem)
