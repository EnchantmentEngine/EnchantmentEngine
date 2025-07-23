import { Entity, entityExists, getAllComponents } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import TransformPropertyGroup from '@ir-engine/ui/src/components/editor/properties/transform'
import React from 'react'
import { ComponentEditorsState } from '../../services/ComponentEditors'

export function IconComponent({ entity }: { entity: Entity }) {
  const icons = entityExists(entity)
    ? getAllComponents(entity)
        .map((c) => getState(ComponentEditorsState)[c.name]?.iconComponent)
        .filter((icon) => !!icon)
    : []
  const _IconComponent = icons.length > 0 ? icons[0] : TransformPropertyGroup.iconComponent
  if (!_IconComponent) return null
  return (
    <_IconComponent entity={entity} className="h-5 w-5 flex-shrink-0" data-testid="hierarchy-panel-scene-item-icon" />
  )
}
