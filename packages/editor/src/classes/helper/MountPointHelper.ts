import { useHelperEntity } from '@ir-engine/spatial/src/helper/functions/useHelperEntity'
import { ArrowHelper } from 'three'

export const MountPointHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const debugEnabled = selected || hovered

  useHelperEntity(parentEntity, () => new ArrowHelper(), debugEnabled)

  return null
}
