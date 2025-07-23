import React from 'react'
import { DndProvider, DropTargetMonitor, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { twMerge } from 'tailwind-merge'

import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'

export interface DragNDropProps extends React.HTMLAttributes<HTMLDivElement> {
  acceptInput?: boolean
  className?: string
  children?: React.ReactNode
  externalChildren?: React.ReactNode // outside label element
  acceptedDropTypes: string[]
  onDropEvent: (files: File[]) => void
}

const DragNDrop = ({
  className,
  children,
  externalChildren,
  acceptedDropTypes,
  onDropEvent,
  ...props
}: DragNDropProps) => {
  const twClassName = twMerge(
    'bg-secondary flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4',
    className
  )
  const [_, drop] = useDrop(
    () => ({
      accept: ItemTypes.File,
      multiple: false,
      canDrop: () => !!props.acceptInput,
      drop(item: { files: any[] }) {
        if (item.files.length !== 1) return
        const extn = item.files[0].name.split('.').pop()
        if (acceptedDropTypes.includes(extn)) {
          onDropEvent(item.files)
        }
      },
      collect: (monitor: DropTargetMonitor) => {
        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop()
        }
      }
    }),
    [props]
  )
  return (
    <div className={twClassName} {...props} ref={drop}>
      <label className="flex h-full w-full cursor-pointer items-center justify-center">
        {children}
        {props.acceptInput && (
          <input
            onChange={(event) => {
              event.preventDefault()
              if (event.target.files) {
                onDropEvent(Array.from(event.target.files))
              }
            }}
            type="file"
            className="hidden"
          />
        )}
      </label>
      {externalChildren}
    </div>
  )
}

const DragNDropWrapper = (props: DragNDropProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <DragNDrop {...props} />
    </DndProvider>
  )
}

export default DragNDropWrapper
