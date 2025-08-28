import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { hasComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { DropdownItem } from '@ir-engine/ui'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import React from 'react'
import { useTranslation } from 'react-i18next'
import CreatePrefabPanel from '../../components/dialogs/CreatePrefabPanelDialog'
import SavePrefabPanel from '../../components/dialogs/SavePrefabDialog'
import { cmdOrCtrlString } from '../../functions/utils'
import { copyNodes, deleteNode, duplicateNode, groupNodes, pasteNodes, ungroupNodes } from './helpers'
import { useHierarchyNodes, useHierarchyTreeContextMenu, useNodeCollapseExpand, useRenamingNode } from './hooks'

export default function HierarchyTreeContextMenu() {
  const { t } = useTranslation()
  const { anchorEvent, setMenu, entity } = useHierarchyTreeContextMenu()
  const renamingNode = useRenamingNode()
  const { expandChildren, collapseChildren } = useNodeCollapseExpand()
  const nodes = useHierarchyNodes()
  const node = nodes.find((n) => n.entity === entity)

  const onDuplicateNode = () => {
    setMenu()
    duplicateNode(entity)
  }

  const onGroupNodes = () => {
    setMenu()
    groupNodes(entity)
  }

  const onUngroupNodes = () => {
    setMenu()
    ungroupNodes(entity)
  }

  const onCopyNode = () => {
    setMenu()
    copyNodes(entity)
  }

  const onPasteNode = () => {
    setMenu()
    pasteNodes(entity)
  }

  const onDeleteNode = () => {
    setMenu()
    deleteNode(entity)
  }

  return (
    <ContextMenu anchorEvent={anchorEvent} open={!!entity} onClose={() => setMenu()}>
      <div className="w-[220px]" data-testid="hierarchy-panel-scene-item-context-menu">
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-rename-button"
          onClick={() => {
            setMenu()
            renamingNode.set(entity)
          }}
          secondaryText={cmdOrCtrlString + ' + r'}
          label={t('editor:hierarchy.lbl-rename')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-duplicate-button"
          onClick={onDuplicateNode}
          secondaryText={cmdOrCtrlString + ' + d'}
          label={t('editor:hierarchy.lbl-duplicate')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-group-button"
          onClick={onGroupNodes}
          secondaryText={cmdOrCtrlString + ' + g'}
          label={t('editor:hierarchy.lbl-group')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-group-button"
          onClick={onUngroupNodes}
          secondaryText={cmdOrCtrlString + ' + u'}
          label={t('editor:hierarchy.lbl-ungroup')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-copy-button"
          onClick={onCopyNode}
          secondaryText={cmdOrCtrlString + ' + c'}
          label={t('editor:hierarchy.lbl-copy')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-paste-button"
          onClick={onPasteNode}
          secondaryText={cmdOrCtrlString + ' + v'}
          label={t('editor:hierarchy.lbl-paste')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-delete-button"
          onClick={onDeleteNode}
          label={t('editor:hierarchy.lbl-delete')}
        />
        {!node?.isLeaf && (
          <>
            <DropdownItem
              onClick={() => {
                setMenu()
                expandChildren(entity)
              }}
              label={t('editor:hierarchy.lbl-expandAll')}
            />
            <DropdownItem
              onClick={() => {
                setMenu()
                collapseChildren(entity)
              }}
              label={t('editor:hierarchy.lbl-collapseAll')}
            />
          </>
        )}
        <DropdownItem
          onClick={() => {
            setMenu()
            ModalState.openModal(<CreatePrefabPanel entity={entity} isExportLookDev={false} />)
          }}
          label={t('editor:hierarchy.lbl-createPrefab')}
        />
        {hasComponent(entity, GLTFComponent) && (
          <DropdownItem
            onClick={() => {
              setMenu()
              ModalState.openModal(<SavePrefabPanel entity={entity} />)
            }}
            label={t('editor:hierarchy.lbl-savePrefab')}
          />
        )}
      </div>
    </ContextMenu>
  )
}
