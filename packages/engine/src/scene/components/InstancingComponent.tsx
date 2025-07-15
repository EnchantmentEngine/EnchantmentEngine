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

import { InstancedBufferAttribute, Matrix4, Quaternion } from 'three'

import { defineComponent, useComponent, useEntityContext } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { useEffect } from 'react'
import { seededRandom } from 'three/src/math/MathUtils'

const identityMatrix = new Matrix4().identity()
const buffer = new InstancedBufferAttribute(new Float32Array([...identityMatrix.elements]), 16)

export const InstancingComponent = defineComponent({
  name: 'InstancingComponent',
  jsonID: 'EE_instancing',

  schema: S.Object({
    auto: S.Bool({ default: false }),
    count: S.Number({ default: 10 }),
    seed: S.Number(),
    //internal
    instanceMatrix: S.Type<InstancedBufferAttribute>({ default: () => buffer, serialized: false })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const instancingComponent = useComponent(entity, InstancingComponent)
    const { auto, count, instanceMatrix, seed } = instancingComponent

    useEffect(() => {
      const matrices = [] as number[]
      const mat4 = new Matrix4()

      const loopSeed = seededRandom(seed.value) * count.value

      for (let i = 0; i < count.value; i++) {
        const rot = new Quaternion().multiply(
          new Quaternion().setFromAxisAngle(Vector3_Up, Math.random() * Math.PI * 2)
        )
        mat4.makeRotationFromQuaternion(rot)

        const x = seededRandom(loopSeed + i + 1)
        const z = seededRandom(loopSeed + i + 2)

        mat4.elements[12] = (x - 0.5) * 6
        mat4.elements[13] = 0
        mat4.elements[14] = (z - 0.5) * 6
        matrices.push(...mat4.elements)
      }

      const buffer = new InstancedBufferAttribute(new Float32Array(matrices), 16)
      instanceMatrix.set(buffer)
    }, [seed, count])

    return null
  }
})
