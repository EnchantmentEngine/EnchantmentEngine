import { AvatarSpawnSystem } from '@ir-engine/client-core/src/networking/AvatarSpawnSystem'
import { OverlaySystem } from '@ir-engine/client-core/src/systems/OverlaySystem'
import { UserUISystem } from '@ir-engine/client-core/src/user/UserUISystem'
import { RenderInfoSystem } from '@ir-engine/spatial/src/renderer/RenderInfoSystem'
// import { EditorInstanceNetworkingSystem } from './components/realtime/EditorInstanceNetworkingSystem'
import { PositionalAudioSystem } from '@ir-engine/client-core/src/systems/PositionalAudioSystem'
import { PoiUiSystem } from '@ir-engine/client-core/src/systems/ui/PoiUI'
import { LightmapSystem } from './lightmapper/LightmapSystem'
import { ActiveHelperSystem } from './systems/ActiveHelperSystem'
import { CameraGizmoSystem } from './systems/CameraGizmoSystem'
import { ClickPlacementSystem } from './systems/ClickPlacementSystem'
import { EditorControlSystem } from './systems/EditorControlSystem'
import { ModelLoadingSpinnerSystem } from './systems/ModelLoadingSpinnerSystem'
import { ObjectGridSnapSystem } from './systems/ObjectGridSnapSystem'
import { RenderMonitorSystem } from './systems/RenderMonitorSystem'
import { SelectionHighlightSystem } from './systems/SelectionHighlightSystem'
import { TransformGizmoSystem } from './systems/TransformGizmoSystem'

export {
  ActiveHelperSystem,
  AvatarSpawnSystem,
  CameraGizmoSystem,
  ClickPlacementSystem,
  EditorControlSystem,
  LightmapSystem,
  ModelLoadingSpinnerSystem,
  ObjectGridSnapSystem,
  OverlaySystem,
  PoiUiSystem,
  PositionalAudioSystem,
  RenderInfoSystem,
  RenderMonitorSystem,
  SelectionHighlightSystem,
  // EditorInstanceNetworkingSystem,
  TransformGizmoSystem,
  UserUISystem
}
