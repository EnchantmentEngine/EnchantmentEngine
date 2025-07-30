import React from 'react'
import { useDragLayer } from 'react-dnd'
import { useTranslation } from 'react-i18next'

import { ItemTypes } from '../../constants/AssetTypes'

const dragLayerContainerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: '99999',
  left: '0',
  right: '0',
  top: '0',
  bottom: '0'
}

const dragPreviewContainerStyles = (offset) => ({
  backgroundColor: 'var(--blue)',
  opacity: '0.3',
  color: 'var(--textColor)',
  padding: '4px',
  borderRadius: '4px',
  display: 'inline-block',
  transform: `translate(${offset.x}px, ${offset.y}px)`
})

export default function DragLayer() {
  const { t } = useTranslation()

  const { item, itemType, currentOffset, isDragging } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging()
  }))

  if (!isDragging || !currentOffset) {
    return null
  }

  let preview

  if (itemType === ItemTypes.Node) {
    if (item.multiple) {
      preview = <div>{t('editor:dnd.nodes', { count: item.value.length })}</div>
    } else {
      preview = <div>{item.value?.name || 'Node'}</div>
    }
  } else {
    preview = <div>{item.prefabType}</div>
  }

  return (
    <div style={dragLayerContainerStyles as React.CSSProperties}>
      <div style={dragPreviewContainerStyles(currentOffset)}>{preview}</div>
    </div>
  )
}
