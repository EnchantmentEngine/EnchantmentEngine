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

import '@ir-engine/spatial'

export * from '../audio/components/PositionalAudioComponent'
export * from '../avatar/components/LoopAnimationComponent'
export * from '../grabbable/GrabbableComponent'
export * from '../interaction/systems/MountPointSystem'
export * from '../scene/materials/systems/MaterialLibrarySystem'
export * from './components/CameraSettingsComponent'
export * from './components/EnvMapBakeComponent'
export * from './components/EnvmapComponent'
export * from './components/GroundPlaneComponent'
export * from './components/HyperspaceTagComponent'
export * from './components/ImageComponent'
export * from './components/LegacyVolumetricComponent'
export * from './components/LinkComponent'
export * from './components/LookAtComponent'
export * from './components/MediaComponent'
export * from './components/MountPointComponent'
export * from './components/ParticleSystemComponent'
export * from './components/PrimitiveGeometryComponent'
export * from './components/RenderSettingsComponent'
export * from './components/SceneDynamicLoadComponent'
export * from './components/ScenePreviewCamera'
export * from './components/SceneSettingsComponent'
export * from './components/ScreenshareTargetComponent'
export * from './components/ShadowComponent'
export * from './components/SkyboxComponent'
export * from './components/SpawnPointComponent'
export * from './components/SplineComponent'
export * from './components/SplineTrackComponent'
export * from './components/TextComponent'
export * from './components/TriggerCallbackComponent'
export * from './components/VariantComponent'
export * from './components/VideoComponent'
export * from './components/VolumetricComponent'
export * from './systems/EnvironmentSystem'
export * from './systems/LookAtSystem'
export * from './systems/ParticleSystemSystem'
export * from './systems/PortalSystem'
export * from './systems/SceneKillHeightSystem'
export * from './systems/SceneNetworkSystem'
export * from './systems/SceneObjectDynamicLoadSystem'
export * from './systems/SceneObjectSystem'
export * from './systems/ShadowSystem'
export * from './systems/TriggerCallbackSystem'
export * from './systems/VariantSystem'

export * from './functions/definePrefab'
