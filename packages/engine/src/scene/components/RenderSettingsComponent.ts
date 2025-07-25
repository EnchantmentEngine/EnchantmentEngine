import { useEffect } from 'react'
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  CustomToneMapping,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  VSMShadowMap
} from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { useRendererEntity } from '@ir-engine/spatial/src/renderer/functions/useRendererEntity'

const ToneMappingSchema = S.LiteralUnion(
  [NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, CustomToneMapping],
  { default: LinearToneMapping }
)

const ShadowMapSchema = S.LiteralUnion([BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap], {
  default: PCFSoftShadowMap
})

export const RenderSettingsComponent = defineComponent({
  name: 'RenderSettingsComponent',
  jsonID: 'EE_render_settings',

  schema: S.Object({
    primaryLight: S.EntityID(),
    csm: S.Bool({ default: true }),
    cascades: S.Number({ default: 5 }),
    toneMapping: ToneMappingSchema,
    toneMappingExposure: S.Number({ default: 0.8 }),
    shadowMapType: ShadowMapSchema
  }),

  reactor: () => {
    const entity = useEntityContext()
    const rendererEntity = useRendererEntity(entity)
    const component = useComponent(entity, RenderSettingsComponent)

    useEffect(() => {
      if (!rendererEntity) return
      const renderer = getComponent(rendererEntity, RendererComponent).renderer!
      renderer.toneMapping = component.toneMapping
    }, [component.toneMapping, rendererEntity])

    useEffect(() => {
      if (!rendererEntity) return
      const renderer = getComponent(rendererEntity, RendererComponent).renderer!
      renderer.toneMappingExposure = component.toneMappingExposure
    }, [component.toneMappingExposure, rendererEntity])

    useEffect(() => {
      if (!rendererEntity) return
      const renderer = getComponent(rendererEntity, RendererComponent).renderer!
      renderer.shadowMap.type = component.shadowMapType
      renderer.shadowMap.needsUpdate = true
    }, [component.shadowMapType, rendererEntity])

    return null
  }
})
