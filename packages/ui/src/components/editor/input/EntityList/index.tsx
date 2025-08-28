import { EntityUUID } from '@ir-engine/ecs'
import { useEntityOptions } from '@ir-engine/engine/src/authoring/functions/useNodeOptions'
import * as bitECS from 'bitecs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaPlus } from 'react-icons/fa'
import { HiMiniXMark } from 'react-icons/hi2'
import Button from '../../../../primitives/tailwind/Button'
import Label from '../../../../primitives/tailwind/Label'
import Text from '../../../../primitives/tailwind/Text'
import SelectInput from '../Select'

interface EntityListInputProps {
  value: EntityUUID[]
  onChange: (entityUUIDs: EntityUUID[]) => void
  filter: bitECS.QueryTerm[]
  placeholder?: string
  label?: string
  className?: string
}

export const EntityListInput = ({ value, onChange, filter, placeholder, label, className }: EntityListInputProps) => {
  const { t } = useTranslation()

  // Query all entities
  const entityOptions = useEntityOptions(filter)

  // Handle adding a new entity to the list
  const handleAddEntity = () => {
    // Add an empty entity ID slot that will be filled via dropdown
    // Using an empty string as a placeholder
    const newEntityIDs = [...value, '' as EntityUUID]
    onChange(newEntityIDs)
  }

  // Handle removing an entity from the list
  const handleRemoveEntity = (index: number) => {
    const newEntityIDs = [...value]
    newEntityIDs.splice(index, 1)
    onChange(newEntityIDs)
  }

  // Handle changing an entity in the list
  const handleChangeEntity = (index: number, entityId: string | number) => {
    const option = entityOptions.value.find((opt) => opt.value === entityId)
    if (!option) return

    const newEntityUUIDs = [...value]
    newEntityUUIDs[index] = option.value
    onChange(newEntityUUIDs)
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <Label>{label}</Label>}

      <div className="mt-2 flex max-h-[300px] flex-col space-y-2 overflow-y-auto">
        {value.length === 0 && (
          <Text className="text-sm italic text-gray-400">
            {placeholder || t('editor:properties.entityList.placeholder')}
          </Text>
        )}

        {value.map((entityUUID, index) => (
          <div key={index} className="flex items-center space-x-2">
            <SelectInput
              options={entityOptions.value.map((opt) => ({
                label: opt.label,
                value: opt.value
              }))}
              value={entityUUID}
              onChange={(value) => handleChangeEntity(index, value)}
              width="full"
            />
            <Button onClick={() => handleRemoveEntity(index)} className="flex-shrink-0">
              <HiMiniXMark className="h-5 w-5" />
            </Button>
          </div>
        ))}
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
