import { Entity, hasComponent, LayerID, Layers, useQuery, UUIDComponent } from '@ir-engine/ecs'
import { ErrorBoundary, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { Button, Input } from '@ir-engine/ui'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { TabData } from 'rc-dock'
import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiFilter, HiGlobeAlt } from 'react-icons/hi'
import { SelectionState } from '../../services/SelectionServices'
import { FixedSizeListWrapper, MATERIALS_PANEL_ID, saveMaterial } from './helpers'
import MaterialLayerNode from './layernode'
import { MaterialPreviewer } from './materialpreviewer'

const MaterialsPanelTitle = () => {
  const { t } = useTranslation()
  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>
          <span>{t('editor:materialLibrary.tab-materials')}</span>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const MaterialsPanelTab: TabData = {
  id: MATERIALS_PANEL_ID,
  closable: true,
  title: <MaterialsPanelTitle />,
  content: (
    <ErrorBoundary fallback={<div>Error occured with the Materials tab</div>}>
      <Suspense>
        <MaterialsLibrary />
      </Suspense>
    </ErrorBoundary>
  )
}

function MaterialsLibrary() {
  const { t } = useTranslation()
  const srcPath = useHookstate('/mat/material-test')
  const materialQuery = useQuery([MaterialStateComponent])
  const nodes = useHookstate<Entity[]>([])
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities)
  const showLayers = useHookstate(false)

  const layer = useHookstate<LayerID>(Layers.Authoring)

  useEffect(() => {
    const materials = materialQuery

    const materialsBySource = {} as Record<string, Entity[]>
    for (const materialEntity of materials) {
      if (!hasComponent(materialEntity, MaterialStateComponent)) continue
      const source = UUIDComponent.getSourceEntity(materialEntity)
      if (!source) continue
      materialsBySource[source] = materialsBySource[source]
        ? [...materialsBySource[source], materialEntity]
        : [materialEntity]
    }
    const materialsBySourceArray = Object.entries(materialsBySource)
    const flattenedMaterials = materialsBySourceArray.reduce(
      (acc: (Entity | string)[], [source, uuids]) => acc.concat([source], uuids),
      []
    ) as Entity[]
    nodes.set(flattenedMaterials)
  }, [materialQuery.length, selectedEntities, showLayers, layer])

  return (
    <div className="h-full overflow-scroll bg-surface-3">
      <div className="w-full rounded-md p-3">
        <MaterialPreviewer />
        <div className="mt-4 flex w-full items-center justify-between gap-x-3">
          <Input
            labelProps={{
              text: 'Save to',
              position: 'left'
            }}
            value={srcPath.value}
            onChange={(e) => srcPath.set(e.target.value)}
            fullWidth
          />
          <Button variant="secondary" onClick={() => saveMaterial(srcPath.value, selectedEntities.value[0])}>
            {t('common:components.save')}
          </Button>
          <Button
            onClick={() => {
              layer.set(
                (prevValue) => (prevValue === Layers.Authoring ? Layers.Simulation : Layers.Authoring) as LayerID
              )
            }}
          >
            {layer.value}
          </Button>
          <div className="mx-2 h-full border-l" />
          <Button
            variant="secondary"
            onClick={() => {
              showLayers.set((prevValue) => !prevValue)
            }}
          >
            {showLayers.value ? <HiFilter /> : <HiGlobeAlt />}
          </Button>
        </div>
      </div>
      <div className="h-full w-full rounded border border-ui-background bg-ui-background p-1">
        <FixedSizeListWrapper nodes={nodes.value}>{MaterialLayerNode}</FixedSizeListWrapper>
      </div>
    </div>
  )
}
