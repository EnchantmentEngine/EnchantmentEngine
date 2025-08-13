import { S } from '@ir-engine/ecs'
import { MeshBasicMaterial } from 'three'
import { defineMaterialPlugin } from './defineMaterialPlugin'

export const BasicMaterialComponent = defineMaterialPlugin({
  name: 'BasicMaterialComponent',
  uniforms: S.Object({}),
  getPrototype: () => MeshBasicMaterial
})
