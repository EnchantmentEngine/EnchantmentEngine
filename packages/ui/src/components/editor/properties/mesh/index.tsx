import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, LayerFunctions, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import MaterialEditor from '@ir-engine/editor/src/panels/properties/materialeditor'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { MaterialInstanceComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { GiMeshBall } from 'react-icons/gi'
import Accordion from '../../../../primitives/tailwind/Accordion'
import GeometryEditor from './geometryEditor'

const materialIsInAuthoringLayer = (entity: Entity) => !!LayerFunctions.getLayerRelationsEntities(entity)?.[0]?.[1]

const MeshNodeEditor: EditorComponentType = (props: { entity: Entity }) => {
  const entity = props.entity
  const { t } = useTranslation()
  const meshComponent = getComponent(entity, MeshComponent)
  const materialInstanceComponent = useComponent(entity, MaterialInstanceComponent)

  return (
    <NodeEditor
      name={t('editor:properties.mesh.name')}
      description={t('editor:properties.mesh.description')}
      Icon={MeshNodeEditor.iconComponent}
      {...props}
    >
      <Accordion title={t('editor:properties.mesh.geometryEditor')}>
        <GeometryEditor geometry={meshComponent?.geometry ?? null} />
      </Accordion>
      {materialInstanceComponent.entities.map((entity) => {
        if (!materialIsInAuthoringLayer(entity)) return null
        return (
          <Accordion title={t('editor:properties.mesh.materialEditor')} key={entity}>
            <MaterialEditor entity={entity} />
          </Accordion>
        )
      })}
    </NodeEditor>
  )
}

MeshNodeEditor.iconComponent = GiMeshBall

export default MeshNodeEditor
