/** World Module */
import '@ir-engine/spatial'

import { HolographicPluginComponent } from './material/plugins/HolographicPlugin'
import { NoiseOffsetPluginComponent } from './material/plugins/NoiseOffsetPlugin'
import { TransparencyDitheringPluginComponent } from './material/plugins/TransparencyDitheringComponent'
import { UVScrollPlugin } from './material/plugins/UVScrollPlugin'

export { HolographicPluginComponent, NoiseOffsetPluginComponent, TransparencyDitheringPluginComponent, UVScrollPlugin }

export * from './assets/AssetModule'
export * from './audio/MediaModule'
export * from './avatar/AvatarModule'
export * from './grabbable/GrabbableSystem'
export * from './interaction/systems/InteractableSystem'
export * from './mocap/MocapModule'
export * from './postprocessing/PopulateEffectRegistry'
export * from './scene/SceneModule'
export * from './visualscript/VisualScriptModule'
