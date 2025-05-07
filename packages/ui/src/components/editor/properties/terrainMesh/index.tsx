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

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import DroppableImageInput from '@ir-engine/editor/src/components/assets/DroppableImageInput'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { TerrainMeshComponent } from '@ir-engine/engine/src/scene/components/TerrainMeshComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { Checkbox } from '@ir-engine/ui'
import Tabs from '@ir-engine/ui/src/primitives/tailwind/Tabs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { GiMountains } from 'react-icons/gi'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import Vector2Input from '../../input/Vector2'

/**
 * TerrainMeshNodeEditor component used to provide the editor view to customize Terrain Mesh properties.
 */
const TerrainMeshNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const terrainMeshComponent = useComponent(props.entity, TerrainMeshComponent)
  const activeTab = useHookstate(0)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.terrainMesh.name', 'Terrain Mesh')}
      description={t(
        'editor:properties.terrainMesh.description',
        'A terrain mesh with physics and triplanar texturing'
      )}
      Icon={TerrainMeshNodeEditor.iconComponent}
    >
      <Tabs
        tabsData={[
          { tabLabel: t('editor:properties.terrainMesh.tabs.geometry', 'Geometry') },
          { tabLabel: t('editor:properties.terrainMesh.tabs.physics', 'Physics') },
          { tabLabel: t('editor:properties.terrainMesh.tabs.materials', 'Materials') }
        ]}
        currentTabIndex={activeTab.value}
        onTabChange={(index) => activeTab.set(index)}
      />

      {activeTab.value === 0 && (
        <>
          <InputGroup
            name="HeightmapURL"
            label={t('editor:properties.terrainMesh.lbl-heightmap', 'Heightmap')}
            info={t('editor:properties.terrainMesh.info-heightmap', 'Grayscale image used to define terrain height')}
          >
            <DroppableImageInput
              src={terrainMeshComponent.heightmapURL.value}
              onBlur={commitProperty(TerrainMeshComponent, 'heightmapURL')}
            />
          </InputGroup>

          <InputGroup name="Width" label={t('editor:properties.terrainMesh.lbl-width', 'Width')}>
            <NumericInput
              min={1}
              max={1000}
              smallStep={1}
              mediumStep={10}
              largeStep={100}
              value={terrainMeshComponent.width.value}
              onChange={updateProperty(TerrainMeshComponent, 'width')}
              onRelease={commitProperty(TerrainMeshComponent, 'width')}
            />
          </InputGroup>

          <InputGroup name="Height" label={t('editor:properties.terrainMesh.lbl-height', 'Height')}>
            <NumericInput
              min={1}
              max={1000}
              smallStep={1}
              mediumStep={10}
              largeStep={100}
              value={terrainMeshComponent.height.value}
              onChange={updateProperty(TerrainMeshComponent, 'height')}
              onRelease={commitProperty(TerrainMeshComponent, 'height')}
            />
          </InputGroup>

          <InputGroup name="Depth" label={t('editor:properties.terrainMesh.lbl-depth', 'Depth')}>
            <NumericInput
              min={1}
              max={1000}
              smallStep={1}
              mediumStep={10}
              largeStep={100}
              value={terrainMeshComponent.depth.value}
              onChange={updateProperty(TerrainMeshComponent, 'depth')}
              onRelease={commitProperty(TerrainMeshComponent, 'depth')}
            />
          </InputGroup>

          <InputGroup
            name="WidthSegments"
            label={t('editor:properties.terrainMesh.lbl-widthSegments', 'Width Segments')}
            info={t(
              'editor:properties.terrainMesh.info-segments',
              'Higher values create more detailed terrain but impact performance'
            )}
          >
            <NumericInput
              min={1}
              max={500}
              smallStep={1}
              mediumStep={10}
              largeStep={50}
              value={terrainMeshComponent.widthSegments.value}
              onChange={updateProperty(TerrainMeshComponent, 'widthSegments')}
              onRelease={commitProperty(TerrainMeshComponent, 'widthSegments')}
            />
          </InputGroup>

          <InputGroup
            name="DepthSegments"
            label={t('editor:properties.terrainMesh.lbl-depthSegments', 'Depth Segments')}
          >
            <NumericInput
              min={1}
              max={500}
              smallStep={1}
              mediumStep={10}
              largeStep={50}
              value={terrainMeshComponent.depthSegments.value}
              onChange={updateProperty(TerrainMeshComponent, 'depthSegments')}
              onRelease={commitProperty(TerrainMeshComponent, 'depthSegments')}
            />
          </InputGroup>
        </>
      )}

      {activeTab.value === 1 && (
        <>
          <InputGroup
            name="EnablePhysics"
            label={t('editor:properties.terrainMesh.lbl-enablePhysics', 'Enable Physics')}
            info={t(
              'editor:properties.terrainMesh.info-enablePhysics',
              'Creates a heightfield collider for the terrain'
            )}
          >
            <Checkbox
              checked={terrainMeshComponent.enablePhysics.value}
              onChange={commitProperty(TerrainMeshComponent, 'enablePhysics')}
            />
          </InputGroup>
        </>
      )}

      {activeTab.value === 2 && (
        <>
          <InputGroup
            name="DiffuseMap1"
            label={t('editor:properties.terrainMesh.lbl-diffuseMap1', 'Base Texture')}
            info={t('editor:properties.terrainMesh.info-diffuseMap1', 'Primary texture for flat areas')}
          >
            <DroppableImageInput
              src={terrainMeshComponent.diffuseMap1.value}
              onBlur={commitProperty(TerrainMeshComponent, 'diffuseMap1')}
            />
          </InputGroup>

          <InputGroup name="NormalMap1" label={t('editor:properties.terrainMesh.lbl-normalMap1', 'Base Normal Map')}>
            <DroppableImageInput
              src={terrainMeshComponent.normalMap1.value}
              onBlur={commitProperty(TerrainMeshComponent, 'normalMap1')}
            />
          </InputGroup>

          <InputGroup name="TexScale1" label={t('editor:properties.terrainMesh.lbl-texScale1', 'Base Texture Scale')}>
            <Vector2Input
              value={terrainMeshComponent.texScale1.value}
              onChange={updateProperty(TerrainMeshComponent, 'texScale1')}
              onRelease={commitProperty(TerrainMeshComponent, 'texScale1')}
            />
          </InputGroup>

          <InputGroup
            name="DiffuseMap2"
            label={t('editor:properties.terrainMesh.lbl-diffuseMap2', 'Slope Texture')}
            info={t('editor:properties.terrainMesh.info-diffuseMap2', 'Texture for sloped areas')}
          >
            <DroppableImageInput
              src={terrainMeshComponent.diffuseMap2.value}
              onBlur={commitProperty(TerrainMeshComponent, 'diffuseMap2')}
            />
          </InputGroup>

          <InputGroup name="NormalMap2" label={t('editor:properties.terrainMesh.lbl-normalMap2', 'Slope Normal Map')}>
            <DroppableImageInput
              src={terrainMeshComponent.normalMap2.value}
              onBlur={commitProperty(TerrainMeshComponent, 'normalMap2')}
            />
          </InputGroup>

          <InputGroup name="TexScale2" label={t('editor:properties.terrainMesh.lbl-texScale2', 'Slope Texture Scale')}>
            <Vector2Input
              value={terrainMeshComponent.texScale2.value}
              onChange={updateProperty(TerrainMeshComponent, 'texScale2')}
              onRelease={commitProperty(TerrainMeshComponent, 'texScale2')}
            />
          </InputGroup>

          <InputGroup
            name="DiffuseMap3"
            label={t('editor:properties.terrainMesh.lbl-diffuseMap3', 'Peak Texture')}
            info={t('editor:properties.terrainMesh.info-diffuseMap3', 'Texture for steep areas like cliffs')}
          >
            <DroppableImageInput
              src={terrainMeshComponent.diffuseMap3.value}
              onBlur={commitProperty(TerrainMeshComponent, 'diffuseMap3')}
            />
          </InputGroup>

          <InputGroup name="NormalMap3" label={t('editor:properties.terrainMesh.lbl-normalMap3', 'Peak Normal Map')}>
            <DroppableImageInput
              src={terrainMeshComponent.normalMap3.value}
              onBlur={commitProperty(TerrainMeshComponent, 'normalMap3')}
            />
          </InputGroup>

          <InputGroup name="TexScale3" label={t('editor:properties.terrainMesh.lbl-texScale3', 'Peak Texture Scale')}>
            <Vector2Input
              value={terrainMeshComponent.texScale3.value}
              onChange={updateProperty(TerrainMeshComponent, 'texScale3')}
              onRelease={commitProperty(TerrainMeshComponent, 'texScale3')}
            />
          </InputGroup>

          <InputGroup
            name="BlendSharpness"
            label={t('editor:properties.terrainMesh.lbl-blendSharpness', 'Blend Sharpness')}
            info={t(
              'editor:properties.terrainMesh.info-blendSharpness',
              'Controls how sharply textures blend together'
            )}
          >
            <NumericInput
              min={0.1}
              max={10}
              smallStep={0.1}
              mediumStep={0.5}
              largeStep={1}
              value={terrainMeshComponent.blendSharpness.value}
              onChange={updateProperty(TerrainMeshComponent, 'blendSharpness')}
              onRelease={commitProperty(TerrainMeshComponent, 'blendSharpness')}
            />
          </InputGroup>

          <InputGroup
            name="NormalScale"
            label={t('editor:properties.terrainMesh.lbl-normalScale', 'Normal Scale')}
            info={t('editor:properties.terrainMesh.info-normalScale', 'Strength of normal maps')}
          >
            <NumericInput
              min={0}
              max={5}
              smallStep={0.1}
              mediumStep={0.5}
              largeStep={1}
              value={terrainMeshComponent.normalScale.value}
              onChange={updateProperty(TerrainMeshComponent, 'normalScale')}
              onRelease={commitProperty(TerrainMeshComponent, 'normalScale')}
            />
          </InputGroup>
        </>
      )}
    </NodeEditor>
  )
}

TerrainMeshNodeEditor.iconComponent = GiMountains

export default TerrainMeshNodeEditor
