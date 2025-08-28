

import { AnimationSystemGroup, defineQuery, defineSystem, ECSState, getComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent, VisibleComponent } from '@ir-engine/spatial'
import { Quaternion, Vector3 } from 'three'

const models = defineQuery([GLTFComponent, TransformComponent, VisibleComponent])

const rotationSpeed = 0.1

const execute = (): void => {
  for (const model of models()) {
    const delta = getState(ECSState).deltaSeconds
    const rotationQuaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), delta * rotationSpeed)
    getComponent(model, TransformComponent).rotation.multiply(rotationQuaternion)
  }
}

export const scriptObjectRotateSystem = defineSystem({
  uuid: 'ee.editor.scriptObjectRotateSystem',
  insert: { before: AnimationSystemGroup },
  execute
})
