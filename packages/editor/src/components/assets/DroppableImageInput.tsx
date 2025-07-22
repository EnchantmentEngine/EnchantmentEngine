import { ImageFileTypes } from '@ir-engine/spatial/src/resources/fileTypes'
import { ImageLink, ImageLinkProps } from '@ir-engine/ui/editor'
import React from 'react'
import { useDrop } from 'react-dnd'
import { twMerge } from 'tailwind-merge'
import { ItemTypes } from '../../constants/AssetTypes'
import useUpload from './useUpload'

const acceptDropItems = [...ItemTypes.Images, ItemTypes.File]

export interface DroppableImageInputProps extends Omit<ImageLinkProps, 'onBlur'> {
  onBlur: (value: string) => void
}

/**
 * allows dropping of a file/asset and takes care of uploading it
 */
export default function DroppableImageInput({ onBlur, ...props }: DroppableImageInputProps) {
  const onUpload = useUpload({
    multiple: false,
    accepts: ImageFileTypes
  })

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: acceptDropItems,
    async drop(item: any, monitor) {
      const isDropType = acceptDropItems.find((element) => element === item.type)
      if (isDropType) {
        onBlur(item.url)
      } else {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        onUpload(entries).then((assets) => {
          if (assets) {
            onBlur(assets[0])
          }
        })
      }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  })

  return (
    <div className={twMerge('rounded-[10px]', canDrop && isOver && 'border border-dotted border-white')} ref={dropRef}>
      <ImageLink onBlur={onBlur} {...props} />
    </div>
  )
}
