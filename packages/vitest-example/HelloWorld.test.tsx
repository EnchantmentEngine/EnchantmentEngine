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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { createEntity, getComponent, query, setComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@ir-engine/engine/src/scene/components/SpawnPointComponent'
import { SkyTypeEnum } from '@ir-engine/engine/src/scene/constants/SkyTypeEnum'
import { getMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'
import React from 'react'
import { Cache } from 'three'
import { assert, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import negX from '../projects/default-project/assets/skyboxsun25deg/negx.jpg'
import EngineSandbox from './EngineSanbox'
import HelloWorld from './HelloWorld'

test.skip('renders name', async () => {
  const { getByText } = render(<HelloWorld name="Vitest" />)
  await expect.element(getByText('Hello Vitest!')).toBeInTheDocument()
})

test.skip('index.html exists', async () => {
  const element = document.getElementById('root')
  console.log(element)
  render(<div id="test22"></div>, { container: element! })
})

test('render engine', async () => {
  Cache.enabled = true

  render(<EngineSandbox />)

  const entity = createEntity()
  getMutableState(RendererState).nodeHelperVisibility.set(true)
  setComponent(entity, SpawnPointComponent)

  let gltfEntity
  await vi.waitUntil(() => {
    const q = query([GLTFComponent])
    const success = q.length > 0
    if (success) gltfEntity = q[0]
    return success
  })
  const gltf = getComponent(gltfEntity, GLTFComponent)
  assert.exists(gltf)
})

const initWorker = async () => {
  const image = await fetch(negX).then((res) => res.arrayBuffer())
  const worker = setupWorker(
    http.get(/[pos|neg]/g, async ({ request }) => {
      console.log(request.url)
      return HttpResponse.arrayBuffer(image)
    })
  )
  return worker
}

const extension = test.extend({
  worker: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const worker = await initWorker()
      await worker.start({ quiet: true })
      await use(worker)
      worker.stop()
    },
    { auto: true }
  ]
})

extension('should intercept', async () => {
  render(<EngineSandbox />)
  const entity = createEntity()
  setComponent(entity, SkyboxComponent, { backgroundType: SkyTypeEnum.cubemap, cubemapPath: 'https://test.com/' })
  await new Promise((resolve) => setTimeout(resolve, 10000))
  console.log('done')
})
