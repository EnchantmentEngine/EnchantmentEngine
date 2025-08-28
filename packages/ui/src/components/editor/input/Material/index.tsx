import React from 'react'
import { DropTargetMonitor, useDrop } from 'react-dnd'

import { EntityUUID } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { ControlledStringInput } from '../String'

export function MaterialInput<T extends { value: Entity; onChange: (val: EntityUUID) => void }>({
  value,
  onChange,
  ...rest
}: T) {
  function onDrop(item: { value?: Entity | Entity[] | undefined }, _monitor: DropTargetMonitor) {
    let element = item.value
    if (typeof element === 'undefined') return
    if (Array.isArray(value)) {
      element = element[0]
    }
    if (typeof element !== 'string') return
    onChange(element)
  }

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Material],
    drop: onDrop,
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  })

  return (
    <ControlledStringInput ref={dropRef} onChange={onChange} canDrop={isOver && canDrop} value={'' + value} {...rest} />
  )
}

MaterialInput.defaultProps = {}

export default MaterialInput
