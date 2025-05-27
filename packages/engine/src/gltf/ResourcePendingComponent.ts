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

import {
  defineComponent,
  Entity,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  removeComponent,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, none } from '@ir-engine/hyperflux'

export const ResourcePendingComponent = defineComponent({
  name: 'ResourcePendingComponent',

  schema: S.Record(
    S.String(),
    S.Object({
      progress: S.Number(),
      total: S.Number()
    })
  ),

  setResource(entity: Entity, url: string, progress: number, total: number) {
    setComponent(entity, ResourcePendingComponent)

    const component = getMutableComponent(entity, ResourcePendingComponent)
    component[url].set({ progress, total })
  },

  removeResource(entity: Entity, url: string) {
    const component = getOptionalMutableComponent(entity, ResourcePendingComponent)
    if (!component) return
    if (!component[url].value) return

    component[url].set(none)

    if (!component.keys.length) {
      removeComponent(entity, ResourcePendingComponent)
    }
  },

  getResourcesLoaded(entity: Entity) {
    const component = getOptionalComponent(entity, ResourcePendingComponent)
    if (!component) return true

    return Object.values(component).every((resource) => resource.progress === 100)
  },

  useResourcesLoaded(entity: Entity) {
    const component = useOptionalComponent(entity, ResourcePendingComponent)
    if (!component) return true

    return Object.values(component.get(NO_PROXY)).every((resource) => resource.progress === 100)
  },

  getResourcesProgress(entity: Entity) {
    const component = getOptionalComponent(entity, ResourcePendingComponent)
    if (!component) return 100

    const resources = Object.values(component)
    const progress = resources.reduce((acc, resource) => acc + resource.progress, 0)
    const total = resources.reduce((acc, resource) => acc + resource.total, 0)
    if (!total) return 0

    return (progress / total) * 100
  },

  useResourcesProgress(entity: Entity) {
    const component = useOptionalComponent(entity, ResourcePendingComponent)
    if (!component) return 100

    const resources = Object.values(component.get(NO_PROXY))
    const progress = resources.reduce((acc, resource) => acc + resource.progress, 0)
    const total = resources.reduce((acc, resource) => acc + resource.total, 0)
    if (!total) return 0

    return (progress / total) * 100
  }
})
