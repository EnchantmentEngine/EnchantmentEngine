// import { assert, describe, it, beforeEach, afterEach, before, after } from 'vitest'
// import { AnimationClip, Bone, Group, SkinnedMesh, Vector3 } from 'three'

// import { overrideFileLoaderLoad } from '../../../tests/util/overrideAssetLoaders'
// import { AssetLoader } from '../../assets/classes/AssetLoader'
// import { createGLTFLoader } from '../../assets/functions/createGLTFLoader'
// import { loadDRACODecoderNode } from '../../assets/loaders/gltf/NodeDracoLoader'
// import { destroyEngine, Engine } from '@ir-engine/ecs/src/Engine'
// import { addComponent, getComponent, setComponent } from '@ir-engine/ecs/srcComponentFunctions'
// import { createEntity } from '@ir-engine/ecs/srcComponentFunctions'
// import { createEngine } from '@ir-engine/ecs/src/Engine'
// import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
// import { setTransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
// import { AnimationManager } from '../AnimationManager'
// import { AnimationComponent } from '../components/AnimationComponent'
// import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
// import { AvatarComponent } from '../components/AvatarComponent'
// import { SkeletonUtils } from '../SkeletonUtils'
// import { animateAvatarModel, boneMatchAvatarModel, makeDefaultSkinnedMesh, rigAvatarModel } from './avatarFunctions'

// const animGLB = '/packages/projects/default-project/assets/Animations.glb'

// overrideFileLoaderLoad()

// before(async () => {
//   await loadDRACODecoderNode()
// })

// const testGLTF = '/packages/projects/default-project/assets/avatars/CyberbotRed.glb'

// describe('avatarFunctions Unit', async () => {
//   let assetModel

//   beforeEach(async () => {
//     createEngine()
//     assetModel = await AssetLoader.loadAsync(testGLTF)
//   })

//   afterEach(() => {
//     return destroyEngine()
//   })

//   // describe('boneMatchAvatarModel', () => {
//   //   it('should set up bone matching', async () => {
//   //     const entity = createEntity()
//   //     addComponent(entity, AvatarAnimationComponent, {} as any)
//   //     const model = boneMatchAvatarModel(entity)(SkeletonUtils.clone(assetModel.scene))
//   //     rigAvatarModel(entity)(model)
//   //     const avatarRigComponent = getComponent(entity, AvatarRigComponent)
//   //     const boneStructure = avatarRigComponent.rig

//   //     assert(boneStructure.Hips)
//   //     assert(boneStructure.Head)
//   //     assert(boneStructure.Neck)
//   //     assert(boneStructure.Spine || boneStructure.Spine1 || boneStructure.Spine2)
//   //     assert(boneStructure.LeftFoot)
//   //     assert(boneStructure.RightFoot)
//   //     assert((boneStructure.RightArm || boneStructure.RightForeArm) && boneStructure.RightHand)
//   //     assert((boneStructure.LeftArm || boneStructure.LeftForeArm) && boneStructure.LeftHand)
//   //     assert((boneStructure.RightUpLeg || boneStructure.RightLeg) && boneStructure.RightFoot)
//   //     assert((boneStructure.LeftUpLeg || boneStructure.LeftLeg) && boneStructure.LeftFoot)
//   //   })
//   // })

//   describe('rigAvatarModel', () => {
//     it('should add rig to skeleton', async () => {
//       const entity = createEntity()
//       addComponent(entity, GroupComponent)
//       addComponent(entity, AvatarAnimationComponent, {} as any)
//       const animationComponent = getComponent(entity, AvatarAnimationComponent)
//       const model = boneMatchAvatarModel(entity)(SkeletonUtils.clone(assetModel.scene))
//       setComponent(entity, AvatarComponent, { model })
//       setTransformComponent(entity)
//       AnimationManager.instance._defaultSkinnedMesh = makeDefaultSkinnedMesh().children[0] as SkinnedMesh
//       rigAvatarModel(entity)(model)
//       assert(animationComponent.rootYRatio > 0)
//     })
//   })

//   describe('animateAvatarModel', () => {
//     it('should use default skeleton hip bone as mixer root', async () => {
//       const entity = createEntity()

//       const animationComponentData = {
//         mixer: null!,
//         animations: [] as AnimationClip[],
//         animationSpeed: 1
//       }

//       addComponent(entity, AnimationComponent, animationComponentData)

//       addComponent(entity, AvatarAnimationComponent, {
//         animationGraph: {
//           states: {},
//           transitionRules: {},
//           currentState: null!,
//           stateChanged: null!
//         },
//         rootYRatio: 1,
//         locomotion: new Vector3()
//       })
//       await AnimationManager.instance.loadDefaultAnimations(animGLB)

//       const group = new Group()
//       animateAvatarModel(entity)(group)

//       const sourceHips = (makeDefaultSkinnedMesh().children[0] as SkinnedMesh).skeleton.bones[0]
//       const mixerRoot = getComponent(entity, AnimationComponent).mixer.getRoot() as Bone

//       assert(mixerRoot.isBone)
//       assert.equal(mixerRoot.name, sourceHips.name)
//       assert.deepEqual(sourceHips.matrix, mixerRoot.matrix)
//     })
//   })
// })
