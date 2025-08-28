import { Entity, UUIDComponent } from '@ir-engine/ecs'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { InfoCircleSm } from '@ir-engine/ui/src/icons'
import React, { useEffect } from 'react'
import { HiCube, HiMiniXMark, HiOutlineChevronRight } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'
import { Tooltip } from '../../..'
import { ComponentDropdownState } from './ComponentDropdownState'

export interface ComponentDropdownProps {
  name?: string
  slug?: string
  description?: string
  /**icon for this component (by default: a cube icon will be shown) */
  Icon?: ({ className }: { className?: string }) => JSX.Element
  /**action when the component is removed */
  onClose?: () => void
  children?: React.ReactNode
  minimizedDefault?: boolean
  entity: Entity
}

export default function ComponentDropdown({
  minimizedDefault,
  Icon = HiCube,
  name,
  slug,
  description,
  children,
  onClose,
  entity
}: ComponentDropdownProps) {
  const entityUUID = UUIDComponent.get(entity)
  const dropdownStateRecord = useMutableState(ComponentDropdownState).componentStates

  // State to track if minimized
  const isMinimized = useHookstate(() => {
    const mindefault = minimizedDefault ?? false
    return name ? dropdownStateRecord[entityUUID][name]?.value ?? minimizedDefault ?? mindefault : mindefault
  })

  // Update isMinimized whenever dependencies change
  useEffect(() => {
    const mindefault = minimizedDefault ?? false
    const currentMinimized = name
      ? dropdownStateRecord[entityUUID][name]?.value ?? minimizedDefault ?? mindefault
      : mindefault
    isMinimized.set(currentMinimized)
  }, [dropdownStateRecord, entityUUID, name, minimizedDefault])

  const toggleMinimized = () => {
    if (name) {
      const newMinimized = !isMinimized.value
      ComponentDropdownState.addOrUpdateUUID(entityUUID, name, newMinimized)
      isMinimized.set(newMinimized)
    }
  }

  return (
    <div className={twMerge('group/component-dropdown w-full bg-surface-3 ', isMinimized.value && 'h-10')} tabIndex={0}>
      <div className="grid w-full cursor-pointer grid-cols-1 items-center p-2" onClick={toggleMinimized}>
        <div className="col-span-1 flex w-full items-center">
          <Tooltip content={isMinimized.value ? 'maximize' : 'minimize'}>
            <button
              className="my-1 text-text-secondary"
              //title={isMinimized.value ? 'maximize' : 'minimize'}
              onClick={toggleMinimized}
            >
              <HiOutlineChevronRight
                className={twMerge('h-4 w-4 transition-transform duration-300', !isMinimized.value ? 'rotate-90' : '')}
                onClick={toggleMinimized}
              />
            </button>
          </Tooltip>

          <div className="flex items-center gap-x-2">
            <button className="ml-2 text-text-secondary group-hover/component-dropdown:text-text-primary group-focus/component-dropdown:text-text-primary">
              <Icon className="h-5 w-5" />
            </button>
            <span className="text-sm leading-6 text-text-secondary group-hover/component-dropdown:text-text-primary group-focus/component-dropdown:text-text-primary">
              {name}
            </span>
            {slug && (
              <a
                className="text-text-secondary hover:text-text-primary"
                target="_blank"
                href={`https://docs.ir.world/${slug}`}
                onClick={(ev) => ev.stopPropagation()}
              >
                <InfoCircleSm />
              </a>
            )}
          </div>
          {onClose && (
            <button className="ml-auto text-text-inactive" onClick={onClose}>
              <HiMiniXMark className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isMinimized.value && (
          <div className="col-span-1 w-full pl-6 pt-2 text-start text-xs text-text-secondary">{description}</div>
        )}
      </div>

      <div className={isMinimized.value ? 'hidden' : ''}>{children}</div>
    </div>
  )
}
