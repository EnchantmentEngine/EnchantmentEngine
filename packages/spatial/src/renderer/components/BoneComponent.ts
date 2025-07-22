import { Bone } from 'three'

import { defineComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ObjectComponent } from './ObjectComponent'

export const BoneComponent = defineComponent({
  name: 'BoneComponent',

  schema: S.Type<Bone>({ required: true }),

  onSet: (entity, component, bone: Bone) => {
    BoneComponent.valueMap[entity] = bone
    setComponent(entity, ObjectComponent, bone)
  },

  onRemove: (entity, component) => {
    removeComponent(entity, ObjectComponent)
  }
})
