import { UndefinedEntity } from '@ir-engine/ecs'
import { SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import { useMutableState } from '@ir-engine/hyperflux'

export const useLoadedSceneEntity = (sceneURL: string | undefined) => {
  const scenes = useMutableState(SceneState)
  return sceneURL ? scenes[sceneURL].value : UndefinedEntity
}
