import {
  ECSState,
  Entity,
  EntityTreeComponent,
  SystemDefinitions,
  Timer,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getComponent,
  setComponent
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { getMutableState, startReactor } from '@ir-engine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import { Color, Group, Texture } from 'three'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { mockEngineRenderer } from '../../tests/util/MockEngineRenderer'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { CameraComponent } from '../camera/components/CameraComponent'
import { RendererState } from './RendererState'
import { WebGLRendererSystem, getNestedVisibleChildren, getSceneParameters } from './WebGLRendererSystem'
import { FogSettingsComponent, FogType } from './components/FogSettingsComponent'
import { ObjectComponent } from './components/ObjectComponent'
import { RendererComponent } from './components/RendererComponent'
import { BackgroundComponent, EnvironmentMapComponent, SceneComponent } from './components/SceneComponents'
import { VisibleComponent } from './components/VisibleComponent'
import { ObjectLayers } from './constants/ObjectLayers'
import { RenderModes } from './constants/RenderModes'

describe('WebGl Renderer System', () => {
  let rootEntity: Entity
  let visibleEntity: Entity
  let invisibleEntity: Entity
  let nestedVisibleEntity: Entity
  let nestedInvisibleEntity: Entity

  beforeEach(async () => {
    createEngine()
    const timer = Timer((time, xrFrame) => {})
    getMutableState(ECSState).timer.set(timer)

    rootEntity = createEntity()
    getMutableState(ReferenceSpaceState).viewerEntity.set(rootEntity)

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, CameraComponent)
    setComponent(rootEntity, VisibleComponent)
    mockEngineRenderer(rootEntity)
    setComponent(rootEntity, BackgroundComponent, new Color(0xffffff))
    setComponent(rootEntity, EnvironmentMapComponent, new Texture())
    setComponent(rootEntity, FogSettingsComponent, { type: FogType.Height })

    invisibleEntity = createEntity()
    setComponent(invisibleEntity, ObjectComponent, new Group())
    setComponent(invisibleEntity, EntityTreeComponent)

    visibleEntity = createEntity()
    setComponent(visibleEntity, VisibleComponent)
    setComponent(visibleEntity, ObjectComponent, new Group())
    setComponent(visibleEntity, EntityTreeComponent)
    setComponent(rootEntity, SceneComponent)

    nestedInvisibleEntity = createEntity()
    setComponent(nestedInvisibleEntity, ObjectComponent, new Group())
    setComponent(nestedInvisibleEntity, EntityTreeComponent)
    setComponent(visibleEntity, SceneComponent)

    nestedVisibleEntity = createEntity()
    setComponent(nestedVisibleEntity, VisibleComponent)
    setComponent(nestedVisibleEntity, ObjectComponent, new Group())
    setComponent(nestedVisibleEntity, EntityTreeComponent)
    setComponent(invisibleEntity, SceneComponent)

    setComponent(rootEntity, RendererComponent, { scenes: [visibleEntity, invisibleEntity] })
    await act(() => render(null))
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Test Background, Environment, Fog Components', async () => {
    const { background, environment, fog, children } = getSceneParameters([rootEntity], UndefinedEntity)
    SystemDefinitions.get(WebGLRendererSystem)?.execute()
    assert(background, 'background component exists')
    const backgroundColor = background as Color
    assert(
      backgroundColor.r == 1 && backgroundColor.g == 1 && backgroundColor.b == 1,
      'backgroud color was set correctly'
    )

    assert(environment, 'environment component exists')
    assert(fog, 'fog component exists')
  })

  it('Test WebGL Reactors', async () => {
    const webGLRendererSystem = SystemDefinitions.get(WebGLRendererSystem)!
    startReactor(webGLRendererSystem.reactor!)

    SystemDefinitions.get(WebGLRendererSystem)?.execute()

    const engineRendererSettings = getMutableState(RendererState)
    engineRendererSettings.renderMode.set(RenderModes.WIREFRAME)
    engineRendererSettings.renderScale.set(2)
    engineRendererSettings.qualityLevel.set(3)
    engineRendererSettings.automatic.set(false)
    engineRendererSettings.physicsDebug.set(true)
    engineRendererSettings.avatarDebug.set(true)
    engineRendererSettings.gridVisibility.set(true)
    engineRendererSettings.nodeHelperVisibility.set(true)

    await vi.waitFor(() => {
      const camera = getComponent(rootEntity, CameraComponent)
      const rendererComp = getComponent(rootEntity, RendererComponent)
      /** @todo we never add a PostProcessing component, so why are these tests expecting an effect composer? */
      // const effectComposer = rendererComp.effectComposer
      // const passes = effectComposer?.passes.filter((p) => p.name === 'RenderPass') as any
      // const renderPass: RenderPass = passes ? passes[0] : undefined

      // assert(renderPass.overrideMaterial, 'change render mode')
      assert(rendererComp.needsResize, 'change render scale')
      assert(camera.layers.isEnabled(ObjectLayers.PhysicsHelper), 'enable physicsDebug')
      assert(camera.layers.isEnabled(ObjectLayers.AvatarHelper), 'enable avatarDebug')
      assert(camera.layers.isEnabled(ObjectLayers.Gizmos), 'enable gridVisibility')
      assert(camera.layers.isEnabled(ObjectLayers.NodeHelper), 'enable nodeHelperVisibility')
    })

    webGLRendererSystem?.execute()

    await vi.waitFor(() => {
      const rendererComp = getComponent(rootEntity, RendererComponent)
      assert(!rendererComp.needsResize, 'resize updated')
      const scenes = getComponent(rootEntity, RendererComponent).scenes
      const entitiesToRender = scenes.map(getNestedVisibleChildren).flat()
      assert(entitiesToRender.length == 1 && entitiesToRender[0] == visibleEntity, 'visible children')
    })
  })
})
