import { setComponent, UndefinedEntity, useComponent } from '@ir-engine/ecs'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import BoxColliderIcon from '@ir-engine/ui/src/components/editor/assets/boxCollider.png'
import CylinderColliderIcon from '@ir-engine/ui/src/components/editor/assets/cylinderCollider.png'
import SphereColiderIcon from '@ir-engine/ui/src/components/editor/assets/sphereCollider.png'
import { useEffect } from 'react'
import { getIconGizmo } from '../../functions/gizmos/studioIconGizmoHelper'

export const ColliderHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const colliderComponent = useComponent(parentEntity, ColliderComponent)

  useEffect(() => {
    if (iconEntity === UndefinedEntity) return
    const icon = (shape = 'box') => {
      switch (shape) {
        case Shapes.Sphere:
        case Shapes.Capsule:
          return SphereColiderIcon
        case Shapes.Cylinder:
          return CylinderColliderIcon
        case Shapes.Box: /* fall-through */
        case Shapes.Plane:
        default:
          return BoxColliderIcon
      }
    }

    const iconHelper = getIconGizmo(icon(colliderComponent?.shape))
    setComponent(iconEntity, ObjectComponent, iconHelper)
  }, [iconEntity, colliderComponent.shape])

  return null
}
