import { useOptionalComponent } from '@ir-engine/ecs'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { useHelperEntity } from '@ir-engine/spatial/src/helper/functions/useHelperEntity'
import { useTexture } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'

const AUDIO_TEXTURE_PATH = '/static/editor/audio-icon.png'

export const MediaHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props
  const mediaComponent = useOptionalComponent(parentEntity, MediaComponent)
  const debugEnabled = (selected || hovered) && mediaComponent?.resources && mediaComponent.resources.length === 0
  const [audioHelperTexture] = useTexture(debugEnabled ? AUDIO_TEXTURE_PATH : '', parentEntity)

  useHelperEntity(
    parentEntity,
    () => {
      const material = new MeshBasicMaterial({
        transparent: true,
        opacity: 0.3,
        side: DoubleSide,
        depthTest: false,
        depthWrite: false
      })

      const plane = new PlaneGeometry()

      return new Mesh(plane, material)
    },
    debugEnabled && !!audioHelperTexture
  )
  return null
}
