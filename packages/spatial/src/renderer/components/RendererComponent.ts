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
  getComponent,
  hasComponent,
  S,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { getState, isDev, useMutableState } from '@ir-engine/hyperflux'
import { Effect, EffectComposer, EffectPass, NormalPass, OutlineEffect, Pass, RenderPass } from 'postprocessing'
import { useEffect } from 'react'
import { ArrayCamera, Scene, SRGBColorSpace, WebGLRenderer, WebGLRendererParameters } from 'three'
import { WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js'
import { PostProcessing, WebGPURenderer } from 'three/webgpu'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { createWebXRManager, WebXRManager } from '../../xr/WebXRManager'
import { ObjectLayers } from '../constants/ObjectLayers'
import { WebGPUPostProcessingPipeline } from '../webgpu/WebGPUPostProcessingPipeline'

import { RenderBackends } from '../constants/RenderModes'
import CSMHelper from '../csm/CSMHelper'
import { HighlightState } from '../HighlightState'
import { RendererState } from '../RendererState'

export const EffectSchema = S.Union([S.Any(), S.Type<Effect>(undefined, { isActive: S.Bool() })])
type PassCount = {
  pass: Pass
  count: number
}
export const RendererComponent = defineComponent({
  name: 'RendererComponent',

  schema: S.Object(
    {
      /** Is resize needed? */
      needsResize: S.Bool({ default: false }),

      renderPass: S.Type<RenderPass | null>(),
      normalPass: S.Type<NormalPass | null>(),
      passes: S.Record(S.String(), S.Type<Pass>()),
      passesFakeMap: S.Record(S.String(), S.Type<PassCount>()),

      renderContext: S.Type<WebGLRenderingContext | null | WebGL2RenderingContext | GPUCanvasContext>(),
      effects: S.Record(S.String(), EffectSchema),
      effectInstances: S.Record(S.String(), S.Type<Effect>()),

      canvas: S.Type<HTMLCanvasElement | null>(),

      renderer: S.Type<WebGPURenderer | WebGLRenderer | null>(),
      effectComposer: S.Type<EffectComposer | null>(),
      postProcessing: S.Type<PostProcessing | null>(),
      webgpuPostProcessingPipeline: S.Type<WebGPUPostProcessingPipeline | null>(),

      scenes: S.Array(S.Entity()),
      scene: S.Class(() => new Scene()),

      /** @todo deprecate and replace with engine implementation */
      xrManager: S.Type<WebXRManager | null>(),
      webGLLostContext: S.Type<WEBGL_lose_context | null>(),

      csmHelper: S.Type<CSMHelper | null>()
    },
    { serialized: false }
  ),

  onInit(entity, initial) {
    initial.scene.matrixAutoUpdate = false
    initial.scene.matrixWorldAutoUpdate = false
    initial.scene.layers.set(ObjectLayers.Scene)
    return initial
  },

  //TODO finish hashing this out
  /**
   * Returns whether a postprocessing render pass is already registered (uses reference counting)
   * @param entity
   * @param passType
   */
  passExists<T extends Pass>(entity: Entity, passType: new (...args: any[]) => T): boolean {
    //return class name as string from constructor implicit name
    const key = passType.name

    const rendererComponent = getComponent(entity, RendererComponent)
    const count = rendererComponent.passesFakeMap[key] ? rendererComponent.passesFakeMap[key].count : 0
    return count > 0
  },

  getPass<T extends Pass>(entity: Entity, passType: new (...args: any[]) => T): T {
    //return class name as string from constructor implicit name
    const key = passType.name

    const rendererComponent = getComponent(entity, RendererComponent)
    return rendererComponent.passesFakeMap[key].pass as T
  },

  /**
   * Registers a postprocessing render pass, and either creates a new instance or increments the reference count of the existing one.
   * @param rendererEntity entity of the RendererComponent
   * @param passType The type of pass to be registered, uses this as a unique key
   * @param passFunction A function that returns a new instance of the pass (for custom initialization needs)
   * @returns The pass instance
   */
  registerPass<T extends Pass>(
    rendererEntity: Entity,
    passType: new (...args: any[]) => T,
    passFunction: (rendererEntity: Entity) => Pass
  ): T {
    //return class name as string from constructor implicit name
    const key = passType.name

    const rendererComponent = getComponent(rendererEntity, RendererComponent)
    if (rendererComponent.passesFakeMap[key]) {
      const count = rendererComponent.passesFakeMap[key].count
      const existingPass = rendererComponent.passesFakeMap[key].pass
      rendererComponent.passesFakeMap[key] = { pass: existingPass, count: count + 1 }
    } else {
      const generatedPass = passFunction(rendererEntity)
      rendererComponent.passesFakeMap[key] = { pass: generatedPass, count: 1 }
    }
    return rendererComponent.passesFakeMap[key].pass as T
  },

  /**
   * Unregisters a postprocessing render pass, and either decrements the reference count or removes the pass entirely.
   * @param entity entity of the RendererComponent
   * @param passType The type of pass to be unregistered, uses this as a unique key
   */
  unregisterPass<T extends Pass>(entity: Entity, passType: new (...args: any[]) => T) {
    //return class name as string from constructor implicit name
    const key = passType.name

    const rendererComponent = getComponent(entity, RendererComponent)
    const count = rendererComponent.passesFakeMap[key].count
    if (count > 1) {
      rendererComponent.passesFakeMap[key].count = count - 1
    } else {
      const effectComposerState = rendererComponent.effectComposer
      const pass = RendererComponent.getPass(entity, passType)
      effectComposerState?.removePass(pass)
      delete rendererComponent.passesFakeMap[key]
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const rendererComponent = useComponent(entity, RendererComponent)
    const camera = useComponent(entity, CameraComponent) as ArrayCamera
    const hightlightState = useMutableState(HighlightState)
    const renderSettings = useMutableState(RendererState)
    const effectComposerState = rendererComponent.effectComposer
    const webgpuFlag = globalThis.location.search.includes('webgpu')
    const shouldUseWebGPU = webgpuFlag && !!(navigator as any).gpu
    // const shouldUseWebGPU = true
    renderSettings.backend.set(shouldUseWebGPU ? RenderBackends.WEBGPU : RenderBackends.WEBGL)
    const effectComposer = rendererComponent.effectComposer

    useEffect(() => {
      const canvas = rendererComponent.canvas as HTMLCanvasElement
      const context = shouldUseWebGPU
        ? (canvas.getContext('webgpu') as GPUCanvasContext)
        : (canvas.getContext('webgl2') as WebGL2RenderingContext)
      rendererComponent.renderContext = context
    }, [])

    useEffect(() => {
      const context = rendererComponent.renderContext as
        | WebGLRenderingContext
        | WebGL2RenderingContext
        | GPUCanvasContext
      if (!context) return

      const canvas = rendererComponent.canvas!
      const initializeRenderer = async (context, canvas) => {
        if (shouldUseWebGPU) {
          try {
            const options: WebGPURendererParameters = {
              powerPreference: 'high-performance',
              stencil: false,
              antialias: false,
              depth: true,
              logarithmicDepthBuffer: false,
              canvas,
              context: context,
              forceWebGL: false
            }

            const renderer = new WebGPURenderer(options)
            await renderer.init()
            console.log('WebGPU renderer initialized')
            rendererComponent.renderer = renderer
            //document.body.appendChild(renderer.domElement)

            renderSettings.features.set({
              astcSupported: renderer.hasFeature('texture-compression-astc'),
              etc1Supported: false,
              etc2Supported: renderer.hasFeature('texture-compression-etc2'),
              dxtSupported: renderer.hasFeature('texture-compression-bc'),
              bptcSupported: renderer.hasFeature('texture-compression-bc'),
              pvrtcSupported: false
            })

            renderer.debug.checkShaderErrors = isDev
            renderer.autoClear = true

            const scene = rendererComponent.scene as Scene
            const webgpuPipeline = new WebGPUPostProcessingPipeline(renderer, scene, camera)
            rendererComponent.webgpuPostProcessingPipeline = webgpuPipeline
            rendererComponent.postProcessing = webgpuPipeline.getPostProcessing()

            getState(RendererState).backend = RenderBackends.WEBGPU

            rendererComponent.effectComposer = null

            return renderer
          } catch (err) {
            console.warn('WebGPU initialization failed, falling back to WebGL:', err)
          }
        }

        const options: WebGLRendererParameters = {
          precision: 'highp',
          powerPreference: 'high-performance',
          stencil: false,
          antialias: false,
          depth: true,
          logarithmicDepthBuffer: false,
          canvas,
          context,
          preserveDrawingBuffer: false,
          //@ts-ignore
          multiviewStereo: true
        }

        const renderer = new WebGLRenderer(options)
        console.log('WebGL renderer initialized')
        rendererComponent.renderer = renderer
        //document.body.appendChild(renderer.domElement)

        renderer.outputColorSpace = SRGBColorSpace
        renderer.debug.checkShaderErrors = isDev
        renderer.autoClear = true

        const composer = new EffectComposer(renderer)
        rendererComponent.effectComposer = composer
        const renderPass = new RenderPass()
        composer.addPass(renderPass)
        rendererComponent.renderPass = renderPass

        // DISABLE THIS IF YOU ARE SEEING SHADER MISBEHAVING - UNCHECK THIS WHEN TESTING UPDATING THREEJS
        renderer.debug.checkShaderErrors = false //isDev

        const xrManager = createWebXRManager(renderer)
        renderer.xr = xrManager as any
        rendererComponent.xrManager = xrManager
        xrManager.cameraAutoUpdate = false
        xrManager.enabled = true

        return renderer
      }

      const onResize = () => {
        rendererComponent.needsResize = true
      }
      canvas.style.touchAction = 'none'
      canvas.addEventListener('resize', onResize, false)
      window.addEventListener('resize', onResize, false)

      initializeRenderer(context, canvas)
        .then((renderer) => {
          console.log('Renderer initialized successfully')
        })
        .catch((err) => {
          console.error('Renderer initialization failed:', err)
        })

      /**
       * This can be tested with document.getElementById('engine-renderer-canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext();
       */
      // rendererComponent.webGLLostContext.set(context.getExtension('WEBGL_lose_context'))

      // if (!rendererComponent.webGLLostContext.value) {
      //   console.warn('Browser does not support `WEBGL_lose_context` extension')
      // }

      // const handleWebGLContextLost = (e) => {
      //   console.log('Browser lost the context.', e, rendererComponent.webGLLostContext.value)
      //   e.preventDefault()
      //   rendererComponent.needsResize.set(false)
      //   setTimeout(() => {
      //     rendererComponent.webGLLostContext.get(NO_PROXY)!.restoreContext()
      //   }, 1)
      // }

      /** @todo this seems unnecessary, since threejs recovers internally */
      // const handleWebGLContextRestore = (e) => {
      //   const canvas = rendererComponent.canvas.value as HTMLCanvasElement
      //   canvas.removeEventListener('webglcontextlost', handleWebGLContextLost)
      //   canvas.removeEventListener('webglcontextrestored', handleWebGLContextRestore)
      //   const context = rendererComponent.supportWebGL2.value
      //     ? canvas.getContext('webgl2')!
      //     : canvas.getContext('webgl')!
      //   rendererComponent.renderContext.set(context)
      //   rendererComponent.needsResize.set(true)
      //   console.log("Browser's context is restored.", e)
      // }

      // canvas.addEventListener('webglcontextlost', handleWebGLContextLost)

      return () => {
        canvas.removeEventListener('resize', onResize, false)
        window.removeEventListener('resize', onResize, false)

        // canvas.removeEventListener('webglcontextlost', handleWebGLContextLost)
        // canvas.removeEventListener('webglcontextrestored', handleWebGLContextRestore)

        //renderer.dispose()
        // composer.dispose()
      }
    }, [rendererComponent.renderContext])

    useEffect(() => {
      if (!rendererComponent.effectComposer) return

      const scene = rendererComponent.scene

      const outlineEffect = new OutlineEffect(scene, camera, getState(HighlightState))
      rendererComponent.effectInstances.OutlineEffect = outlineEffect
      setComponent(entity, RendererComponent)

      return () => {
        if (!hasComponent(entity, RendererComponent)) return
        outlineEffect.dispose()
        delete rendererComponent.effectInstances.OutlineEffect
        setComponent(entity, RendererComponent)
      }
    }, [!!rendererComponent.effectComposer, hightlightState])

    useEffect(() => {
      if (!effectComposer) return

      const effectsVal = rendererComponent.effects as Record<string, Effect>

      const enabled = renderSettings.usePostProcessing.value as boolean

      const effectArray = enabled ? Object.values(effectsVal) : []
      if (rendererComponent.effectInstances.OutlineEffect)
        effectArray.unshift(rendererComponent.effectInstances.OutlineEffect as OutlineEffect)

      const effectPass = new EffectPass(camera, ...effectArray)
      effectComposer.EffectPass = effectPass

      if (enabled) {
        for (const key in effectsVal) effectComposer[key] = effectsVal[key]
      }

      try {
        if (rendererComponent.passesFakeMap) {
          for (const pass of Object.values(rendererComponent.passesFakeMap)) {
            effectComposer.addPass(pass.pass)
          }
        }
        effectComposer.addPass(effectPass)
      } catch (e) {
        console.warn(e) /** @todo Implement user messaging Ex: (Can not use multiple convolution effects) */
      }

      effectComposer.setRenderer(rendererComponent.renderer as WebGLRenderer)
      setComponent(entity, RendererComponent)

      return () => {
        if (!hasComponent(entity, RendererComponent)) return
        const enabled = renderSettings.usePostProcessing.value as boolean
        if (enabled) {
          for (const effect in effectsVal) {
            effectsVal[effect].dispose()
            delete effectComposer[effect]
          }
        }
        setComponent(entity, RendererComponent)
        effectComposer.EffectPass.dispose()
        effectComposer.removePass(effectPass)
        if (rendererComponent.passesFakeMap.value) {
          for (const pass of Object.values(rendererComponent.passesFakeMap)) {
            effectComposer.removePass(pass.pass)
          }
        }
      }
    }, [
      JSON.stringify(Object.keys(rendererComponent.effects)),
      !!rendererComponent.effectComposer,
      !!rendererComponent?.effectInstances?.OutlineEffect,
      renderSettings.usePostProcessing.value
    ])

    useEffect(() => {
      const webgpuPipeline = rendererComponent.webgpuPostProcessingPipeline
      if (!webgpuPipeline) return

      const enabled = renderSettings.usePostProcessing.value
      const effectsVal = rendererComponent.effects

      if (enabled && effectsVal) {
        webgpuPipeline.updateEffects(effectsVal)
      } else {
        webgpuPipeline.updateEffects({})
      }
    }, [
      rendererComponent.effects,
      rendererComponent.webgpuPostProcessingPipeline,
      renderSettings.usePostProcessing.value
    ])

    return null
  }
})

// Add the postprocessing module declarations
declare module 'postprocessing' {
  interface EffectComposer {
    EffectPass: EffectPass
    OutlineEffect: OutlineEffect
  }
  interface Effect {
    isActive: boolean
  }
}
