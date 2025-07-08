/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { InstancedBufferAttribute, Matrix4 } from 'three'

import { defineComponent, useComponent, useEntityContext } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { useEffect } from 'react'
import { Quaternion } from 'three'

export const InstancingComponent = defineComponent({
  name: 'InstancingComponent',
  jsonID: 'EE_instancing',

  schema: S.Object({
    instanceMatrix: S.Class(() => new InstancedBufferAttribute(new Float32Array(16), 16)),
    auto: S.Bool({ default: false }),
    count: S.Number({ default: 10 })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const instancingComponent = useComponent(entity, InstancingComponent)
    const { auto, count } = instancingComponent

    useEffect(() => {
      if (!auto.value) return

      const matrices = [] as number[]
      const mat4 = new Matrix4()

      for (let i = 0; i < count.value; i++) {
        const rot = new Quaternion().multiply(
          new Quaternion().setFromAxisAngle(Vector3_Up, Math.random() * Math.PI * 2)
        )
        mat4.makeRotationFromQuaternion(rot)
        mat4.elements[12] = (Math.random() - 0.5) * 6
        mat4.elements[13] = 0
        mat4.elements[14] = (Math.random() - 0.5) * 6
        matrices.push(...mat4.elements)
      }

      const matrix = new InstancedBufferAttribute(new Float32Array(matrices), 16)
      instancingComponent.instanceMatrix.set(matrix)
    }, [auto.value, count.value])

    return null
  }
})
