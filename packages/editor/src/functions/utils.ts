import { isApple } from '@ir-engine/common/src/utils/getDeviceStats'
import { Entity, EntityTreeComponent, getComponent, getOptionalComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EditorState } from '../services/EditorServices'

export function isEntityGlb(entity: Entity): boolean {
  const gltfComponent = getOptionalComponent(entity, GLTFComponent)
  if (!gltfComponent) return false
  const trimmedFilename = gltfComponent?.src.split('?')[0]
  return trimmedFilename !== undefined && trimmedFilename.endsWith('.glb')
}

export function getStepSize(event, smallStep, mediumStep, largeStep) {
  if (event.altKey) {
    return smallStep
  } else if (event.shiftKey) {
    return largeStep
  }
  return mediumStep
}

export const cmdOrCtrlString = isApple() ? 'meta' : 'ctrl'

export const getIncreamentedName = (requestedName: string, parentEntity = getState(EditorState).rootEntity) => {
  const siblings = getComponent(parentEntity, EntityTreeComponent).children
  let counter = 0
  siblings.forEach((child) => {
    const name = getComponent(child, NameComponent)
    const match = name.match(/^(.*?)\s+(\d+)?$/)
    const adjustedName = match ? match[1] : name
    if (adjustedName === requestedName || name === requestedName) {
      counter++
    }
  })
  if (counter > 0) {
    requestedName = `${requestedName} ${counter}`
  }
  return requestedName
}
