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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getComponent, UUIDComponent } from '@ir-engine/ecs'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { Button } from '@ir-engine/ui'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import { PlusCircleSm } from '@ir-engine/ui/src/icons'
import React, { useCallback, useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import { twMerge } from 'tailwind-merge'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import ElementList from '../properties/elementlist'
import { getNodeElId } from './helpers'
import HierarchyTreeNode from './hierarchynode'
import { useHierarchyNodes, useHierarchyTreeDrop, useHierarchyTreeHotkeys } from './hooks'

export function Topbar() {
  const { t } = useTranslation()
  const search = useHookstate(getMutableState(HierarchyTreeState).search)
  const isAddEntityMenuOpen = useHookstate(false)

  return (
    <div className="flex items-center justify-between gap-x-4 bg-surface-3 p-1" data-testid="hierarchy-panel-top-bar">
      <SearchBar inputProps={{ fullWidth: true }} search={search} debounceTime={100} />
      <Popup
        keepInside
        open={isAddEntityMenuOpen.value}
        onClose={() => isAddEntityMenuOpen.set(false)}
        trigger={
          <Button
            variant="tertiary"
            size="xs"
            data-testid="hierarchy-panel-add-entity-button"
            onClick={() => isAddEntityMenuOpen.set(true)}
          >
            <PlusCircleSm />
            <span className="text-nowrap">{t('editor:hierarchy.lbl-addEntity')}</span>
          </Button>
        }
      >
        <div className="h-full w-96 overflow-y-auto">
          <ElementList type="prefabs" onSelect={() => isAddEntityMenuOpen.set(false)} />
        </div>
      </Popup>
    </div>
  )
}

export function Contents() {
  const listDimensions = useHookstate({
    height: 0,
    width: 0
  })
  const nodes = useHierarchyNodes()
  const ref = useRef<HTMLDivElement>(null)

  const { canDrop, isOver, dropTarget: treeContainerDropTarget } = useHierarchyTreeDrop(nodes?.[0], 'On')

  /**an explicit callback is required to rerender changed nodes inside FixedSizeList */
  const MemoTreeNode = useCallback(
    (props: ListChildComponentProps<undefined>) => <HierarchyTreeNode {...props} />,
    [nodes]
  )

  useEffect(() => {
    if (!ref.current) return
    const handleResize = () => {
      if (!ref.current) return
      const { height, width } = ref.current.getBoundingClientRect()
      listDimensions.set({ height, width })
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(ref.current)
    return () => resizeObserver.disconnect()
  }, [])

  useHierarchyTreeHotkeys()
  useHotkeys('ArrowUp', () => {
    const selectedEntity = getMutableState(HierarchyTreeState).firstSelectedEntity.value
    const index = nodes.findIndex((node) => node.entity === selectedEntity)
    if (index === -1) return
    const upperNode = nodes.at(index - 1)
    if (!upperNode) return
    const upperNodeEl = document.getElementById(getNodeElId(upperNode))
    upperNodeEl?.focus()
    EditorControlFunctions.replaceSelection([getComponent(upperNode.entity, UUIDComponent)])
    getMutableState(HierarchyTreeState).firstSelectedEntity.set(upperNode.entity)
  })
  useHotkeys('ArrowDown', () => {
    const selectedEntity = getMutableState(HierarchyTreeState).firstSelectedEntity.value
    const index = nodes.findIndex((node) => node.entity === selectedEntity)
    if (index === -1) return
    let lowerNode = nodes.at(index + 1)
    if (!lowerNode) {
      lowerNode = nodes.at(0)
    }
    const lowerNodeEl = document.getElementById(getNodeElId(lowerNode!))
    lowerNodeEl?.focus()
    EditorControlFunctions.replaceSelection([getComponent(lowerNode!.entity, UUIDComponent)])
    getMutableState(HierarchyTreeState).firstSelectedEntity.set(lowerNode!.entity)
  })

  return (
    <div
      ref={ref}
      tabIndex={0}
      className={twMerge('h-5/6 overflow-hidden', isOver && canDrop && 'border border-dotted')}
      data-testid="hierarchy-panel-scene-item-list"
    >
      <FixedSizeList
        height={listDimensions.height.value}
        width={listDimensions.width.value}
        itemSize={40}
        itemData={{ nodes }}
        itemCount={nodes.length}
        itemKey={(index: number) => index}
        outerRef={treeContainerDropTarget}
        innerElementType="ul"
      >
        {MemoTreeNode}
      </FixedSizeList>
    </div>
  )
}
