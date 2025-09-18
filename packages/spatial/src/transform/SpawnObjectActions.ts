import { SpawnEntityProps } from '@ir-engine/ecs'
import { TransformComponent } from './TransformModule'

export type SpawnObjectProps = {
  [TransformComponent.jsonID]: {
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number; w: number }
  }
}

export const spawnObject = (props: SpawnEntityProps<SpawnObjectProps>) => spawnObject(props)
