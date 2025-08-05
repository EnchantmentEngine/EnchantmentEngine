import { Entity, UUIDComponent, getComponent, hasComponent } from '@ir-engine/ecs'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/materials/MaterialComponent'
import { ContainerLg, Image05, MaterialsLg } from '@ir-engine/ui/src/icons'
import React from 'react'
import { useDrag } from 'react-dnd'
import { ListChildComponentProps } from 'react-window'
import { twMerge } from 'tailwind-merge'

export default function MaterialLayerNode(props: ListChildComponentProps<{ nodes: Entity[] }>) {
  const data = props.data
  const entity = data.nodes[props.index]
  const materialSelection = useHookstate(getMutableState(SelectionState).selectedEntities[0])
  const selectionState = useMutableState(SelectionState)

  const source = !hasComponent(entity, MaterialStateComponent)
  const name = getComponent(entity, NameComponent)
  const onClickNode = () => {
    if (!source) {
      materialSelection.set(UUIDComponent.get(entity))
    }
  }

  const [_dragProps, drag] = useDrag({
    type: ItemTypes.Material,
    item() {
      const selectedEntities = selectionState.selectedEntities.value
      const multiple = selectedEntities.length > 1
      return {
        type: ItemTypes.Material,
        multiple,
        value: entity
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  return (
    <li style={props.style} ref={drag} onClick={onClickNode}>
      <div ref={drag} tabIndex={0} onClick={onClickNode}>
        {source ? (
          <div className="flex w-full items-center justify-start gap-x-1 bg-ui-background py-0.5 pl-3.5 pr-3">
            <ContainerLg className="text-base text-text-primary" />
            <Image05 className="text-base text-text-primary" />
            <div className="flex items-center">
              <div className="ml-2 min-w-0 text-nowrap rounded px-0.5 py-0 text-text-primary">
                <span className="text-nowrap text-sm leading-4">{name}</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={twMerge(
              'flex w-full cursor-pointer items-center justify-start bg-ui-background pl-9 pr-6 text-text-secondary hover:bg-ui-hover-background hover:text-text-primary',
              materialSelection.value === name ? 'text-text-primary' : '',
              materialSelection.value === name ? 'rounded border border-ui-select-primary' : 'border-none'
            )}
          >
            <MaterialsLg className="text-base" />
            <div className="flex items-center">
              <div className="ml-2 min-w-0 text-nowrap rounded bg-transparent px-0.5 py-0">
                <span className="text-nowrap text-sm leading-4">{name}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
