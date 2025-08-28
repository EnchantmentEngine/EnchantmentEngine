import { Layers, UUIDComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { Button } from '@ir-engine/ui'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import { PlusCircleSm } from '@ir-engine/ui/src/icons'
import React, { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import { twMerge } from 'tailwind-merge'
import { EditorState } from '../../services/EditorServices'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import { SelectionState } from '../../services/SelectionServices'
import ElementList from '../properties/elementlist'
import { HierarchyTreeNodeType } from './helpers'
import HierarchyTreeNode from './hierarchynode'
import { useAllHierarchyNodes, useHierarchyNodes, useHierarchyTreeDrop, useHierarchyTreeHotkeys } from './hooks'

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
  const allNodes = useAllHierarchyNodes()
  const ref = useRef<HTMLDivElement>(null)
  const { selectedEntities } = useHookstate(getMutableState(SelectionState)).value
  const rootEntity = useMutableState(EditorState).rootEntity.value
  const expandedNodes = useMutableState(HierarchyTreeState).expandedNodes
  const manualCollapseExpand = useMutableState(HierarchyTreeState).manualCollapseExpand
  const sourceID = GLTFComponent.useSourceID(rootEntity)

  const { canDrop, isOver, dropTarget: treeContainerDropTarget } = useHierarchyTreeDrop(nodes?.[0], 'On')

  /**an explicit callback is required to rerender changed nodes inside FixedSizeList */
  const MemoTreeNode = useCallback(
    (props: ListChildComponentProps<undefined>) => <HierarchyTreeNode {...props} />,
    [allNodes]
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
  const listRef = useRef<FixedSizeList>(null)

  const getVisibleNodes = (all: HierarchyTreeNodeType[]) => {
    const result: HierarchyTreeNodeType[] = []

    const isNodeVisible = (node: HierarchyTreeNodeType) => {
      if (!node.parentEntity) return true
      const parent = all.find((n) => n.entity === node.parentEntity)
      if (!parent) return true
      return expandedNodes[sourceID][parent.entity].value && isNodeVisible(parent)
    }

    for (const node of all) {
      if (isNodeVisible(node)) result.push(node)
    }

    return result
  }

  const visibleNodes = getVisibleNodes([...nodes])

  /**
   * for the entity click function to expand + scroll to the item (scrollToItem) on
   * hierarchy list, we need two useEffect because of race/render issue
   */
  const shouldScroll = useRef(false)

  useEffect(() => {
    if (manualCollapseExpand.value) return

    const selectedEntity = selectedEntities[0]
    if (!selectedEntity || !sourceID) return

    const selectedEid = UUIDComponent.getEntityByUUID(selectedEntity, Layers.Authoring)
    const selectedNode = allNodes.find((n) => n.entity === selectedEid)
    if (!selectedNode) return

    // expanding collapsed parents
    let current = selectedNode
    while (current?.parentEntity !== undefined) {
      const parentNode = allNodes.find((n) => n.entity === current.parentEntity)
      if (!parentNode) break

      if (!expandedNodes[sourceID]?.[parentNode.entity]?.value) {
        expandedNodes[sourceID][parentNode.entity].set(true)
      }

      current = parentNode
    }
    shouldScroll.current = true
  }, [selectedEntities, sourceID, allNodes, manualCollapseExpand.value, expandedNodes])

  useEffect(() => {
    if (!shouldScroll.current || !sourceID || !listRef.current) return

    const selectedEntity = selectedEntities[0]
    const selectedEid = UUIDComponent.getEntityByUUID(selectedEntity, Layers.Authoring)
    const visibleNodes = getVisibleNodes([...allNodes])
    const index = visibleNodes.findIndex((n) => n.entity === selectedEid)

    if (index >= 0) {
      listRef.current.scrollToItem(index, 'center')
      shouldScroll.current = false
      getMutableState(HierarchyTreeState).manualCollapseExpand.set(false)
    }
  }, [allNodes, expandedNodes[sourceID]])

  return (
    <div
      ref={ref}
      tabIndex={0}
      className={twMerge('h-5/6 overflow-hidden bg-surface-1', isOver && canDrop && 'border border-dotted')}
      data-testid="hierarchy-panel-scene-item-list"
    >
      <FixedSizeList
        ref={listRef}
        height={listDimensions.height.value}
        width={listDimensions.width.value}
        itemSize={40}
        itemData={{ nodes: visibleNodes }}
        itemCount={visibleNodes.length}
        itemKey={(index: number) => index}
        outerRef={treeContainerDropTarget}
        innerElementType="ul"
      >
        {MemoTreeNode}
      </FixedSizeList>
    </div>
  )
}
