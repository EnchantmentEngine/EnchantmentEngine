import { clamp } from 'lodash'
import { AnimationClip, AnimationMixer, LoopOnce, LoopRepeat, Vector3 } from 'three'

import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'
import { lerp } from '@ir-engine/spatial/src/common/functions/MathLerpFunctions'

import { AnimationState } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { preloadedAnimations } from './Util'

export const getAnimationAction = (name: string, mixer: AnimationMixer, animations?: AnimationClip[]) => {
  const manager = getState(AnimationState)
  const clip = AnimationClip.findByName(
    animations ??
      getComponent(manager.loadedAnimations[preloadedAnimations.locomotion]!, AnimationComponent).animations,
    name
  )
  return mixer.clipAction(clip!)
}

const currentActionBlendSpeed = 7
const epsilon = 0.01

export const setAnimation = (
  targetEntity: Entity,
  newAnimation: {
    animationName: string
    loop: boolean
    clipName: string
    once: boolean | null
    layer: number | null
  }
) => {
  const animationState = getState(AnimationState)
  const animationAsset = animationState.loadedAnimations[newAnimation.animationName]
  if (!animationAsset) {
    console.warn('[updateAnimationGraph]: Animation asset not loaded', animationAsset, targetEntity)
    return
  }
  const graph = getComponent(targetEntity, AvatarAnimationComponent).animationGraph
  graph.fadingOut = newAnimation.once ?? false
  graph.layer = newAnimation.layer ?? 0
  playAvatarAnimationFromMixamo(targetEntity, animationAsset, !!newAnimation.loop, newAnimation.clipName)
}

//blend between locomotion and animation clips
export const updateAnimationGraph = (avatarEntities: Entity[]) => {
  for (const entity of avatarEntities) {
    const animationGraph = getComponent(entity, AvatarAnimationComponent).animationGraph

    setAvatarLocomotionAnimation(entity)

    const currentAction = animationGraph.blendAnimation

    if (currentAction) {
      const deltaSeconds = getState(ECSState).deltaSeconds
      const locomotionBlend = animationGraph.blendStrength
      currentAction.setEffectiveWeight(locomotionBlend)
      if (
        (currentAction.time >= currentAction.getClip().duration - epsilon && currentAction.loop != LoopRepeat) ||
        animationGraph.fadingOut
      ) {
        currentAction.setEffectiveTimeScale(0)
        animationGraph.blendStrength = Math.max(locomotionBlend - deltaSeconds * currentActionBlendSpeed, 0)
        if (locomotionBlend <= 0) {
          currentAction.setEffectiveWeight(0)
          animationGraph.fadingOut = false
          animationGraph.blendAnimation = undefined
        }
      } else {
        animationGraph.blendStrength = Math.min(locomotionBlend + deltaSeconds * currentActionBlendSpeed, 1)
      }
    }
  }
}

/** Retargets a mixamo animation to the entity's avatar model, then blends in and out of the default locomotion state. */
export const playAvatarAnimationFromMixamo = (
  entity: Entity,
  animationsEntity: Entity,
  loop?: boolean,
  clipName?: string
) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  const rigComponent = getComponent(entity, AvatarRigComponent)
  if (!rigComponent || !rigComponent.bonesToEntities.hips) return
  //if animation is already present on animation component, use it instead of retargeting again
  const animationsScene = getComponent(animationsEntity, AnimationComponent)
  let retargetedAnimation = animationComponent.animations.find(
    (clip) => clip.name == (clipName ?? animationsScene.animations[0].name)
  )

  if (!retargetedAnimation) retargetedAnimation = animationsScene.animations[0]

  const action = avatarAnimationComponent.animationGraph.blendAnimation
  //before setting animation, stop previous animation if it exists
  if (action) action.stop()
  //set the animation to the current action
  avatarAnimationComponent.animationGraph.blendAnimation = getAnimationAction(
    retargetedAnimation.name,
    animationComponent.mixer,
    animationComponent.animations
  )

  const newAction = avatarAnimationComponent.animationGraph.blendAnimation
  if (newAction) {
    newAction.timeScale = 1
    newAction.time = 0
    newAction.loop = loop ? LoopRepeat : LoopOnce
    newAction.play()
  }
}

const moveLength = new Vector3()
let runWeight = 0,
  walkWeight = 0,
  idleWeight = 1

export const setAvatarLocomotionAnimation = (entity: Entity) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  if (!animationComponent.animations) return
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

  const idle = getAnimationAction('Idle', animationComponent.mixer, animationComponent.animations)
  const run = getAnimationAction('Run', animationComponent.mixer, animationComponent.animations)
  const walk = getAnimationAction('Walk', animationComponent.mixer, animationComponent.animations)
  if (!idle || !run || !walk) return
  idle.play()
  run.play()
  walk.play()

  //for now we're hard coding layer overrides into the locomotion blending function
  const animationGraph = avatarAnimationComponent.animationGraph
  const idleBlendStrength = animationGraph.blendStrength
  const layerOverride = animationGraph.layer > 0
  const locomoteBlendStrength = layerOverride ? animationGraph.blendStrength : 0

  const magnitude = moveLength.copy(avatarAnimationComponent.locomotion).setY(0).lengthSq()
  if (animationGraph.blendAnimation && magnitude > 1 && idleBlendStrength >= 1 && !layerOverride)
    animationGraph.fadingOut = true

  walkWeight = lerp(
    walk.getEffectiveWeight(),
    clamp(1 / (magnitude - 1.65) - locomoteBlendStrength, 0, 1),
    getState(ECSState).deltaSeconds * 4
  )
  runWeight = clamp(magnitude * 0.1 - walkWeight, 0, 1) - locomoteBlendStrength // - fallWeight
  idleWeight = clamp(1 - runWeight - walkWeight, 0, 1) // - fallWeight
  run.setEffectiveWeight(runWeight)
  walk.setEffectiveWeight(walkWeight)
  idle.setEffectiveWeight(idleWeight - idleBlendStrength)
}

export const getRootSpeed = (clip: AnimationClip) => {
  //calculate the speed of the root motion of the clip
  const tracks = clip.tracks
  const rootTrack = tracks[0]
  if (!rootTrack) return 0
  const startPos = new Vector3(rootTrack.values[0], rootTrack.values[1], rootTrack.values[2])
  const endPos = new Vector3(
    rootTrack.values[rootTrack.values.length - 3],
    rootTrack.values[rootTrack.values.length - 2],
    rootTrack.values[rootTrack.values.length - 1]
  )
  const speed = new Vector3().subVectors(endPos, startPos).length() / clip.duration
  return speed
}
