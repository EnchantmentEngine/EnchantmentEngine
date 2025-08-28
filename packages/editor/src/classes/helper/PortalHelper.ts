import { Vector3_Right, Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { useHelperEntity } from '@ir-engine/spatial/src/helper/functions/useHelperEntity'
import { ArrowHelper } from 'three'

export const PortalHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const debugEnabled = selected || hovered

  useHelperEntity(parentEntity, () => new ArrowHelper(Vector3_Right, Vector3_Zero, 1, 0x000000), debugEnabled)

  return null
}
