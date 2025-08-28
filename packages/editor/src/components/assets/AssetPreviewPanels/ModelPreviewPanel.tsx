import { t } from 'i18next'
import React, { useEffect, useRef } from 'react'

import { useRender3DPanelSystem } from '@ir-engine/client-core/src/hooks/useRender3DPanelSystem'
import { EntityTreeComponent, createEntity, removeComponent, removeEntity, setComponent } from '@ir-engine/ecs'
import { EnvMapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { AmbientLightComponent, TransformComponent } from '@ir-engine/spatial'
import { AssetPreviewCameraComponent } from '@ir-engine/spatial/src/camera/components/AssetPreviewCameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import styles from '../styles.module.scss'

export const ModelPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  const loading = useHookstate(true)

  const error = useHookstate('')
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)

  useEffect(() => {
    const { sceneEntity, cameraEntity } = renderPanel
    setComponent(sceneEntity, NameComponent, '3D Preview Entity')
    setComponent(sceneEntity, GLTFComponent, { src: url, cameraOcclusion: false })
    setComponent(sceneEntity, EnvMapComponent, { type: 'Skybox', envMapIntensity: 2 }) // todo remove when lighting works
    setComponent(cameraEntity, AssetPreviewCameraComponent, { targetModelEntity: sceneEntity })

    const lightEntity = createEntity()
    setComponent(lightEntity, AmbientLightComponent)
    setComponent(lightEntity, TransformComponent)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, NameComponent, 'Ambient Light')
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: sceneEntity })
    loading.set(false)

    return () => {
      loading.set(true)
      removeComponent(sceneEntity, GLTFComponent)
      removeComponent(sceneEntity, EnvMapComponent)
      removeComponent(cameraEntity, AssetPreviewCameraComponent)
      removeEntity(lightEntity)
    }
  }, [url])

  return (
    <>
      {loading.value && <LoadingView className="h-6 w-6" title={t('common:loader.loading')} />}
      {error.value && (
        <div className={styles.container}>
          <h1 className={styles.error}>{error.value}</h1>
        </div>
      )}
      <div id="modelPreview" style={{ width: '100%', height: '100%' }}>
        <canvas
          id="model-preview-canvas"
          ref={panelRef}
          style={{ width: '100%', height: '100%', pointerEvents: 'all' }}
        />
      </div>
    </>
  )
}
