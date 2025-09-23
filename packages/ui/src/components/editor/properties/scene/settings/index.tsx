import getImagePalette from 'image-palette-core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SceneThumbnailState } from '@ir-engine/editor/src/services/SceneThumbnailState'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { getMutableState, useState } from '@ir-engine/hyperflux'
import { ImageLink } from '@ir-engine/ui/editor'
import { RiLandscapeLine } from 'react-icons/ri'
import Button from '../../../../../primitives/tailwind/Button'
import ColorInput from '../../../../../primitives/tailwind/Color'
import LoadingView from '../../../../../primitives/tailwind/LoadingView'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'

export const SceneSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const sceneSettingsComponent = useComponent(props.entity, SceneSettingsComponent)
  const sceneThumbnailState = getMutableState(SceneThumbnailState)

  const generateColors = () => {
    const url = sceneThumbnailState.thumbnailURL.value ?? sceneSettingsComponent.thumbnailURL
    if (!url) return
    const image = new Image()
    image.crossOrigin = 'Anonymous'
    image.onload = () => {
      const palette = getImagePalette(image)
      if (palette) {
        commitProperties(SceneSettingsComponent, {
          primaryColor: palette.color,
          backgroundColor: palette.backgroundColor,
          alternativeColor: palette.alternativeColor
        })
      }
    }
    image.src = url
  }

  const useSpectatingEntity = useState(!!sceneSettingsComponent.spectateEntity)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.sceneSettings.name')}
      description={t('editor:properties.sceneSettings.description')}
      Icon={SceneSettingsEditor.iconComponent}
      entity={props.entity}
    >
      {/* <InputGroup
        name="Spectate Entity"
        label={t('editor:properties.sceneSettings.lbl-spectate')}
        info={t('editor:properties.sceneSettings.info-spectate')}
      >
        <Checkbox
          checked={useSpectatingEntity}
          onChange={(value) => {
            useSpectatingEntity.set(value)
          }}
        />
      </InputGroup>
      {useSpectatingEntity.value ? (
        <InputGroup
          name="Entity UUID"
          label={t('editor:properties.sceneSettings.lbl-uuid')}
          info={t('editor:properties.sceneSettings.info-uuid')}
        >
          <NodeInput
            value={sceneSettingsComponent.spectateEntity}
            onRelease={commitProperty(SceneSettingsComponent, `spectateEntity`)}
            onChange={commitProperty(SceneSettingsComponent, `spectateEntity`)}
          />
        </InputGroup>
      ) : (
        <></>
      )} */}
      {/*@note disabled as this functionality was broken and it has been replaced by ScenePreviewCamera*/}
      {/*<InputGroup*/}
      {/*  name="Thumbnail"*/}
      {/*  label={t('editor:properties.sceneSettings.lbl-thumbnail')}*/}
      {/*  info={t('editor:properties.sceneSettings.info-thumbnail')}*/}
      {/*  className="w-auto"*/}
      {/*>*/}
      {/*  <div>*/}
      {/*    <ImageLink src={sceneThumbnailState.thumbnailURL.value ?? sceneSettingsComponent.thumbnailURL} />*/}

      {/*    <Button onClick={SceneThumbnailState.createThumbnail} className="mt-2 w-full">*/}
      {/*      {t('editor:properties.sceneSettings.generate')}*/}
      {/*    </Button>*/}
      {/*    {sceneThumbnailState.uploadingThumbnail.value ? (*/}
      {/*      <LoadingView spinnerOnly />*/}
      {/*    ) : (*/}
      {/*      <Button*/}
      {/*        onClick={() => {*/}
      {/*          SceneThumbnailState.uploadThumbnail(props.entity)*/}
      {/*        }}*/}
      {/*        disabled={!sceneThumbnailState.thumbnail}*/}
      {/*        className="mt-2 w-full"*/}
      {/*      >*/}
      {/*        {t('editor:properties.sceneSettings.save')}*/}
      {/*      </Button>*/}
      {/*    )}*/}
      {/*  </div>*/}
      {/*</InputGroup>*/}
      <InputGroup
        name="Loading Screen"
        label={t('editor:properties.sceneSettings.lbl-loading')}
        info={t('editor:properties.sceneSettings.info-loading')}
        className="w-auto"
      >
        <div>
          <ImageLink src={sceneThumbnailState.loadingScreenURL.value ?? sceneSettingsComponent.loadingScreenURL} />
          <Button onClick={SceneThumbnailState.createLoadingScreen} className="mt-2 w-full">
            {t('editor:properties.sceneSettings.generate')}
          </Button>
          {sceneThumbnailState.uploadingLoadingScreen.value ? (
            <LoadingView spinnerOnly />
          ) : (
            <Button
              onClick={() => {
                SceneThumbnailState.uploadLoadingScreen(props.entity)
              }}
              disabled={!sceneThumbnailState.loadingScreenImageData}
              className="mt-2 w-full"
            >
              {t('editor:properties.sceneSettings.save')}
            </Button>
          )}
        </div>
      </InputGroup>
      <InputGroup name="Primary Color" label={t('editor:properties.sceneSettings.lbl-colors')}>
        <div className="w-full space-y-2">
          <ColorInput
            disabled={!sceneThumbnailState.thumbnailURL.value && !sceneSettingsComponent.thumbnailURL}
            value={new Color(sceneSettingsComponent.primaryColor)}
            onChange={(val) => updateProperty(SceneSettingsComponent, 'primaryColor')('#' + val.getHexString())}
            onRelease={(val) => commitProperty(SceneSettingsComponent, 'primaryColor')('#' + val.getHexString())}
            className="w-full"
          />
          <ColorInput
            disabled={!sceneThumbnailState.thumbnailURL.value && !sceneSettingsComponent.thumbnailURL}
            value={new Color(sceneSettingsComponent.backgroundColor)}
            onChange={(val) => updateProperty(SceneSettingsComponent, 'backgroundColor')('#' + val.getHexString())}
            onRelease={(val) => commitProperty(SceneSettingsComponent, 'backgroundColor')('#' + val.getHexString())}
            className="w-full"
          />
          <ColorInput
            disabled={!sceneThumbnailState.thumbnailURL.value && !sceneSettingsComponent.thumbnailURL}
            value={new Color(sceneSettingsComponent.alternativeColor)}
            onChange={(val) => updateProperty(SceneSettingsComponent, 'alternativeColor')('#' + val.getHexString())}
            onRelease={(val) => commitProperty(SceneSettingsComponent, 'alternativeColor')('#' + val.getHexString())}
            className="w-full"
          />
          <Button onClick={generateColors} className="w-full">
            {t('editor:properties.sceneSettings.generate')}
          </Button>
        </div>
      </InputGroup>
      <InputGroup name="Kill Height" label={t('editor:properties.sceneSettings.lbl-killHeight')}>
        <NumericInput
          value={sceneSettingsComponent.sceneKillHeight}
          onChange={updateProperty(SceneSettingsComponent, 'sceneKillHeight')}
          onRelease={commitProperty(SceneSettingsComponent, 'sceneKillHeight')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

SceneSettingsEditor.iconComponent = RiLandscapeLine
export default SceneSettingsEditor
