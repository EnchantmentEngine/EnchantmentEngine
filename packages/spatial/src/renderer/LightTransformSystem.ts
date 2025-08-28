import { defineQuery, defineSystem, Entity, getComponent } from '@ir-engine/ecs'
import { SpotLight, Vector3 } from 'three'
import { TransformSystem } from '../transform/systems/TransformSystem'
import { ObjectComponent } from './components/ObjectComponent'
import { DirectionalLightComponent } from './components/lights/DirectionalLightComponent'
import { SpotLightComponent } from './components/lights/SpotLightComponent'

const _vec3 = new Vector3()

const spotLightQuery = defineQuery([ObjectComponent, SpotLightComponent])
const directionalLightQuery = defineQuery([ObjectComponent, DirectionalLightComponent])

const updateLight = (entity: Entity) => {
  const light = getComponent(entity, ObjectComponent) as SpotLight
  if (!light?.target) return
  light.getWorldDirection(_vec3)
  light.getWorldPosition(light.target.position).add(_vec3)
  light.target.updateMatrixWorld()
}

const execute = () => {
  for (const entity of directionalLightQuery()) updateLight(entity)
  for (const entity of spotLightQuery()) updateLight(entity)
}

export const LightTransformSystem = defineSystem({
  uuid: 'ee.engine.LightTransformSystem',
  insert: { after: TransformSystem },
  execute
})
