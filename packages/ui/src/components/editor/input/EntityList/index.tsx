/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Entity, EntityUUID, UUIDComponent, getComponent, hasComponent, useQuery } from '@ir-engine/ecs'
import { useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import React, { useEffect, useRef, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { FaPlus } from 'react-icons/fa'
import { HiMiniXMark } from 'react-icons/hi2'
import { MdDragIndicator } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'
import Button from '../../../../primitives/tailwind/Button'
import Label from '../../../../primitives/tailwind/Label'
import Text from '../../../../primitives/tailwind/Text'
import SelectInput from '../Select'

const ItemType = {
  entityListItem: 'entityListItem'
}

interface EntityListItem {
  uuid: string
  entityUUID: EntityUUID
}

type EntityOptionType = { label: string; value: EntityUUID; entity: Entity }

interface EntityListInputProps {
  value: EntityUUID[]
  onChange: (entityUUIDs: EntityUUID[]) => void
  filter?: (entity: Entity) => boolean
  placeholder?: string
  label?: string
  className?: string
}

const DraggableEntityItem = ({
  entityUUID,
  index,
  entityOptions,
  onChangeEntity,
  onRemoveEntity,
  listItem,
  moveListItem,
  findListItem
}: {
  entityUUID: EntityUUID
  index: number
  entityOptions: EntityOptionType[]
  onChangeEntity: (index: number, entityId: string | number) => void
  onRemoveEntity: (index: number) => void
  listItem: EntityListItem
  moveListItem: (itemUUID: string, atIndex: number) => void
  findListItem: (itemUUID: string) => { listItem: EntityListItem | undefined; index: number }
}) => {
  const originalIndex = () => {
    if (findListItem) {
      return findListItem(listItem.uuid).index
    } else {
      return undefined
    }
  }

  const [{ opacity }, dragSourceRef, previewRef] = useDrag({
    type: ItemType.entityListItem,
    item: { uuid: listItem.uuid, index: originalIndex },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0 : 1
    })
  })

  const [{ isDroppable }, dropRef] = useDrop(() => ({
    accept: ItemType.entityListItem,
    hover({ uuid: draggedItemUUID }: { uuid: string; index: number }) {
      if (draggedItemUUID !== listItem.uuid) {
        const { index: overIndex } = findListItem(listItem.uuid)
        moveListItem(draggedItemUUID, overIndex)
      }
    },
    collect: (monitor) => ({
      isDroppable: monitor.canDrop() && monitor.isOver()
    })
  }))

  return (
    <div
      className={twMerge('flex items-center space-x-2', isDroppable && 'outline outline-2 outline-white')}
      style={{ opacity }}
      ref={(node) => {
        dropRef(previewRef(node))
      }}
    >
      <div ref={dragSourceRef} className="flex h-full w-6 cursor-move items-center text-xl text-text-inactive">
        <MdDragIndicator />
      </div>
      <SelectInput
        options={entityOptions.map((opt) => ({
          label: opt.label,
          value: opt.value
        }))}
        value={entityUUID}
        onChange={(value) => onChangeEntity(index, value)}
        width="full"
      />
      <Button onClick={() => onRemoveEntity(index)} className="flex-shrink-0">
        <HiMiniXMark className="h-5 w-5" />
      </Button>
    </div>
  )
}

export const EntityListInput = ({ value, onChange, filter, placeholder, label, className }: EntityListInputProps) => {
  const { t } = useTranslation()
  const entityOptions = useHookstate<EntityOptionType[]>([])
  const lastValueRef = useRef<EntityUUID[]>(value)

  // Create list items with UUIDs for drag-and-drop tracking
  const [listItems, setListItems] = useState<EntityListItem[]>(() =>
    value.map((entityUUID) => ({
      uuid: uuidv4(),
      entityUUID
    }))
  )

  // Query all entities
  const allEntities = useQuery([])

  // Update entity options when entities change
  useEffect(() => {
    // Filter entities if a filter function is provided
    const filteredEntities = filter ? allEntities.filter(filter) : allEntities

    // Create options for the Select components
    const options = filteredEntities.map((entity) => {
      const name = hasComponent(entity, NameComponent) ? getComponent(entity, NameComponent) : `Entity ${entity}`

      const entityUUID = hasComponent(entity, UUIDComponent) ? UUIDComponent.get(entity) : (`${entity}` as EntityUUID)

      return {
        label: name,
        value: entityUUID,
        entity
      }
    })

    entityOptions.set(options)
  }, [allEntities.length, filter])

  // Update list items when value prop changes from outside
  if (JSON.stringify(lastValueRef.current) !== JSON.stringify(value)) {
    lastValueRef.current = value
    setListItems(
      value.map((entityUUID) => ({
        uuid: uuidv4(),
        entityUUID
      }))
    )
  }

  // Drag and drop helper functions
  const findListItem = (itemUUID: string) => {
    for (let i = 0; i < listItems.length; i++) {
      const item = listItems[i]
      if (item.uuid === itemUUID) {
        return {
          listItem: item,
          index: i
        }
      }
    }
    return {
      listItem: undefined,
      index: -1
    }
  }

  const moveListItem = (itemUUID: string, atIndex: number) => {
    const { listItem, index } = findListItem(itemUUID)
    if (listItem && index !== -1) {
      const newListItems = [...listItems]
      newListItems.splice(index, 1)
      newListItems.splice(atIndex, 0, listItem)
      setListItems(newListItems)

      // Update parent immediately with new order
      const newEntityUUIDs = newListItems.map((item) => item.entityUUID)
      lastValueRef.current = newEntityUUIDs
      onChange(newEntityUUIDs)
    }
  }

  // Handle adding a new entity to the list
  const handleAddEntity = () => {
    // Add an empty entity ID slot that will be filled via dropdown
    const newListItems = [...listItems, { uuid: uuidv4(), entityUUID: '' as EntityUUID }]
    setListItems(newListItems)

    const newEntityUUIDs = newListItems.map((item) => item.entityUUID)
    lastValueRef.current = newEntityUUIDs
    onChange(newEntityUUIDs)
  }

  // Handle removing an entity from the list
  const handleRemoveEntity = (index: number) => {
    const newListItems = [...listItems]
    newListItems.splice(index, 1)
    setListItems(newListItems)

    const newEntityUUIDs = newListItems.map((item) => item.entityUUID)
    lastValueRef.current = newEntityUUIDs
    onChange(newEntityUUIDs)
  }

  // Handle changing an entity in the list
  const handleChangeEntity = (index: number, entityId: string | number) => {
    const option = entityOptions.value.find((opt) => opt.value === entityId)
    if (!option) return

    const newListItems = [...listItems]
    newListItems[index] = { ...newListItems[index], entityUUID: option.value }
    setListItems(newListItems)

    const newEntityUUIDs = newListItems.map((item) => item.entityUUID)
    lastValueRef.current = newEntityUUIDs
    onChange(newEntityUUIDs)
  }

  const [, drop] = useDrop(() => ({ accept: ItemType.entityListItem }))

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <Label>{label}</Label>}

      <div className="mt-2 flex max-h-[300px] flex-col space-y-2 overflow-y-auto">
        {listItems.length === 0 && (
          <Text className="text-sm italic text-gray-400">
            {placeholder || t('editor:properties.entityList.placeholder')}
          </Text>
        )}

        {listItems.length > 0 && (
          <DndProvider backend={HTML5Backend}>
            <div ref={drop} className="flex flex-col space-y-2">
              {listItems.map((listItem, index) => (
                <DraggableEntityItem
                  key={listItem.uuid}
                  entityUUID={listItem.entityUUID}
                  index={index}
                  entityOptions={Array.from(entityOptions.value)}
                  onChangeEntity={handleChangeEntity}
                  onRemoveEntity={handleRemoveEntity}
                  listItem={listItem}
                  moveListItem={moveListItem}
                  findListItem={findListItem}
                />
              ))}
            </div>
          </DndProvider>
        )}
      </div>

      <div className="mt-2 flex justify-end">
        <Button variant="secondary" size="sm" onClick={handleAddEntity} className="flex items-center gap-1">
          <FaPlus className="h-3 w-3" />
          <span>{t('editor:properties.entityList.addEntity', 'Add Entity')}</span>
        </Button>
      </div>
    </div>
  )
}

export default EntityListInput
