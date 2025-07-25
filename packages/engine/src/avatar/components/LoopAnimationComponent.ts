import { useEffect } from 'react'
import {
  AdditiveAnimationBlendMode,
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  LoopPingPong,
  LoopRepeat,
  NormalAnimationBlendMode
} from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useHookstate } from '@ir-engine/hyperflux'
import { StandardCallbacks, removeCallback, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { retargetAnimationClips } from '../functions/retargetingFunctions'
import { setupMixamoAnimation } from '../systems/AvatarAnimationSystem'
import { AnimationComponent, useLoadAnimationFromGLTF } from './AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from './AvatarAnimationComponent'

const AnimationBlendMode = S.LiteralUnion([NormalAnimationBlendMode, AdditiveAnimationBlendMode], {
  default: NormalAnimationBlendMode
})

const AnimationActionLoopStyles = S.LiteralUnion([LoopOnce, LoopRepeat, LoopPingPong], { default: LoopRepeat })

export const LoopAnimationComponent = defineComponent({
  name: 'LoopAnimationComponent',
  jsonID: 'EE_loop_animation',

  schema: S.Object({
    activeClipIndex: S.Number({ default: -1 }),
    animationPack: S.String({ default: '' }),
    useVRM: S.Bool({ default: false }),
    // TODO: support blending multiple animation actions. Refactor into AnimationMixerComponent and AnimationActionComponent
    enabled: S.Bool({ default: true }),
    paused: S.Bool({ default: false }),
    time: S.Number({ default: 0 }),
    timeScale: S.Number({ default: 1 }),
    blendMode: AnimationBlendMode,
    loop: AnimationActionLoopStyles,
    repetitions: S.Number({ default: Infinity, serialized: false }), //No longer serializable for now. We don't expose in editor anyway
    clampWhenFinished: S.Bool({ default: false }),
    zeroSlopeAtStart: S.Bool({ default: true }),
    zeroSlopeAtEnd: S.Bool({ default: true }),
    weight: S.Number({ default: 1 }),

    // internal
    _action: S.Type<AnimationAction | null>({ serialized: false, default: null })
  }),

  reactor: function () {
    const entity = useEntityContext()

    const loopAnimationComponent = useComponent(entity, LoopAnimationComponent)
    const animComponent = useOptionalComponent(entity, AnimationComponent)
    const rigComponent = useOptionalComponent(entity, AvatarRigComponent)
    const lastAnimationPack = useHookstate('')
    useEffect(() => {
      if (!animComponent?.animations || (loopAnimationComponent.useVRM && rigComponent?.bonesToEntities.hips)) return

      if (loopAnimationComponent._action) {
        loopAnimationComponent._action.stop()
      }

      if (loopAnimationComponent.activeClipIndex === -1) {
        if (animComponent.mixer) {
          animComponent.mixer.stopAllAction()
        }
        loopAnimationComponent._action = null
        return
      }

      const clip = animComponent.animations[loopAnimationComponent.activeClipIndex] as AnimationClip
      if (!clip) {
        loopAnimationComponent._action = null
        return
      }
      animComponent.mixer.time = 0
      const action = animComponent.mixer.clipAction(clip)
      loopAnimationComponent._action = action

      if (!loopAnimationComponent.paused) {
        action.play()
      }

      return () => {
        action.stop()
      }
    }, [loopAnimationComponent.activeClipIndex, rigComponent?.bonesToEntities.hips, animComponent?.animations])

    useEffect(() => {
      if (!loopAnimationComponent.useVRM && hasComponent(entity, AvatarRigComponent)) {
        removeComponent(entity, AvatarRigComponent)
        removeComponent(entity, AvatarAnimationComponent)
      } else if (loopAnimationComponent.useVRM && !hasComponent(entity, AvatarRigComponent)) {
        setComponent(entity, AvatarRigComponent)
        setComponent(entity, AvatarAnimationComponent)
        setComponent(entity, AnimationComponent, { mixer: new AnimationMixer(getComponent(entity, ObjectComponent)) })
      }
    }, [loopAnimationComponent.useVRM])

    const animationAction = loopAnimationComponent._action as AnimationAction

    useEffect(() => {
      if (!animationAction) {
        if (animComponent?.mixer && !loopAnimationComponent.paused) {
          animComponent.mixer.stopAllAction()
        }
        return
      }

      if (animationAction.isRunning()) {
        animationAction.paused = loopAnimationComponent.paused
      } else if (!animationAction.isRunning() && !loopAnimationComponent.paused) {
        if (animComponent) animComponent.mixer.stopAllAction()
        animationAction.paused = false
        animationAction.play()
      }
    }, [loopAnimationComponent._action, loopAnimationComponent.paused])

    useEffect(() => {
      if (!animationAction) return
      animationAction.enabled = loopAnimationComponent.enabled
    }, [loopAnimationComponent._action, loopAnimationComponent.enabled])

    useEffect(() => {
      if (!animationAction) return
      animationAction.time = loopAnimationComponent.time
      animationAction.setLoop(loopAnimationComponent.loop, loopAnimationComponent.repetitions ?? Infinity)
      animationAction.clampWhenFinished = loopAnimationComponent.clampWhenFinished
      animationAction.zeroSlopeAtStart = loopAnimationComponent.zeroSlopeAtStart
      animationAction.zeroSlopeAtEnd = loopAnimationComponent.zeroSlopeAtEnd
      animationAction.blendMode = loopAnimationComponent.blendMode
      animationAction.loop = loopAnimationComponent.loop
    }, [
      loopAnimationComponent._action,
      loopAnimationComponent.repetitions,
      loopAnimationComponent.blendMode,
      loopAnimationComponent.loop,
      loopAnimationComponent.clampWhenFinished,
      loopAnimationComponent.zeroSlopeAtStart,
      loopAnimationComponent.zeroSlopeAtEnd,
      loopAnimationComponent.activeClipIndex
    ])

    useEffect(() => {
      if (!animationAction) return
      animationAction.setEffectiveWeight(loopAnimationComponent.weight)
      animationAction.setEffectiveTimeScale(loopAnimationComponent.timeScale)
    }, [loopAnimationComponent._action, loopAnimationComponent.weight, loopAnimationComponent.timeScale])

    useEffect(() => {
      if (!animationAction) return
      animationAction.time = loopAnimationComponent.time
    }, [loopAnimationComponent.time])

    /**
     * Callback functions
     */
    useEffect(() => {
      const play = () => {
        setComponent(entity, LoopAnimationComponent, { paused: false })
      }
      const pause = () => {
        setComponent(entity, LoopAnimationComponent, { paused: true })
      }
      const stop = () => {
        setComponent(entity, LoopAnimationComponent, {
          paused: true,
          time: 0
        })

        if (loopAnimationComponent._action) {
          loopAnimationComponent._action.stop()
        }

        if (animComponent?.mixer) {
          animComponent.mixer.stopAllAction()
        }
      }
      setCallback(entity, StandardCallbacks.PLAY, play)
      setCallback(entity, StandardCallbacks.PAUSE, pause)
      setCallback(entity, StandardCallbacks.STOP, stop)

      return () => {
        removeCallback(entity, StandardCallbacks.PLAY)
        removeCallback(entity, StandardCallbacks.PAUSE)
        removeCallback(entity, StandardCallbacks.STOP)
      }
    }, [])

    const animationPackGLTF = useLoadAnimationFromGLTF(loopAnimationComponent.animationPack, true)
    const animationPackRigComponent = useOptionalComponent(entity, AvatarRigComponent)

    useEffect(() => {
      if (
        (!animationPackGLTF[0].value && loopAnimationComponent.animationPack !== '') ||
        !animComponent?.animations ||
        (loopAnimationComponent.animationPack !== '' &&
          lastAnimationPack.value === loopAnimationComponent.animationPack) ||
        loopAnimationComponent.animationPack === ''
      )
        return

      animComponent.mixer.time = 0
      animComponent.mixer.stopAllAction()

      setupMixamoAnimation(animationPackGLTF[1])
      retargetAnimationClips(animationPackGLTF[1])
      animComponent.animations = getComponent(animationPackGLTF[1], AnimationComponent).animations
      lastAnimationPack.set(loopAnimationComponent.animationPack)
    }, [animationPackGLTF, animComponent])

    useEffect(() => {
      if (!animComponent?.animations) return
      const animations = animComponent.animations
      if (animations.length === 0) return
      const callbackNames: string[] = []
      for (let i = 0; i < animations.length; i++) {
        const clip = animations[i] as AnimationClip
        const callbackName = `Switch to Animation ${clip.name}`
        setCallback(entity, callbackName, () => {
          loopAnimationComponent.activeClipIndex = i
        })
        callbackNames.push(callbackName)
      }
      return () => {
        for (const name of callbackNames) {
          removeCallback(entity, name)
        }
      }
    }, [animComponent?.animations, animationPackRigComponent?.bonesToEntities])

    return null
  }
})
