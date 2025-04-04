import { createEntity, getComponent, query, setComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { SpawnPointComponent } from '@ir-engine/engine/src/scene/components/SpawnPointComponent'
import { getMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import React from 'react'
import { Cache } from 'three'
import { assert, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
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
  console.log(gltfEntity)
  const gltf = getComponent(gltfEntity, GLTFComponent)
  assert.exists(gltf)
})
