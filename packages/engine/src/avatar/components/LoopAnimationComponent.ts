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

import { Schema } from '@ir-engine/hyperflux'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { retargetAnimationClips } from '../functions/retargetingFunctions'
import { setupMixamoAnimation } from '../systems/AvatarAnimationSystem'
import { AnimationComponent, useLoadAnimationFromGLTF } from './AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from './AvatarAnimationComponent'

const AnimationBlendMode = Schema.LiteralUnion([NormalAnimationBlendMode, AdditiveAnimationBlendMode], {
  default: NormalAnimationBlendMode
})

const AnimationActionLoopStyles = Schema.LiteralUnion([LoopOnce, LoopRepeat, LoopPingPong], { default: LoopRepeat })

export const LoopAnimationComponent = defineComponent({
  name: 'LoopAnimationComponent',
  jsonID: 'EE_loop_animation',

  schema: Schema.Object({
    activeClipIndex: Schema.Number({ default: -1 }),
    animationPack: Schema.String({ default: '' }),
    useVRM: Schema.Bool({ default: false }),
    // TODO: support blending multiple animation actions. Refactor into AnimationMixerComponent and AnimationActionComponent
    enabled: Schema.Bool({ default: true }),
    paused: Schema.Bool({ default: false }),
    time: Schema.Number({ default: 0 }),
    timeScale: Schema.Number({ default: 1 }),
    blendMode: AnimationBlendMode,
    loop: AnimationActionLoopStyles,
    repetitions: Schema.Number({ default: Infinity, serialized: false }), //No longer serializable for now. We don't expose in editor anyway
    clampWhenFinished: Schema.Bool({ default: false }),
    zeroSlopeAtStart: Schema.Bool({ default: true }),
    zeroSlopeAtEnd: Schema.Bool({ default: true }),
    weight: Schema.Number({ default: 1 }),

    // internal
    _action: Schema.Type<AnimationAction | null>({ serialized: false, default: null })
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
        setComponent(entity, LoopAnimationComponent, { _action: null })
        return
      }

      const clip = animComponent.animations[loopAnimationComponent.activeClipIndex] as AnimationClip
      if (!clip) {
        setComponent(entity, LoopAnimationComponent, { _action: null })
        return
      }
      animComponent.mixer.time = 0
      const action = animComponent.mixer.clipAction(clip)
      setComponent(entity, LoopAnimationComponent, { _action: action })

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
    }, [animationPackGLTF, animComponent?.animations])

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
