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
  VSMShadowMap,
  WebGLRenderer
} from 'three'

import { EntitySchema, useEntityContext } from '@ir-engine/ecs'
import { defineComponent, getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { useRendererEntity } from '@ir-engine/spatial/src/renderer/functions/useRendererEntity'

const ToneMappingSchema = Schema.LiteralUnion(
  [NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, CustomToneMapping],
  { default: LinearToneMapping }
)

const ShadowMapSchema = Schema.LiteralUnion([BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap], {
  default: PCFSoftShadowMap
})

export const RenderSettingsComponent = defineComponent({
  name: 'RenderSettingsComponent',
  jsonID: 'EE_render_settings',

  schema: Schema.Object({
    primaryLight: EntitySchema.EntityID(),
    csm: Schema.Bool({ default: true }),
    cascades: Schema.Number({ default: 5 }),
    toneMapping: ToneMappingSchema,
    toneMappingExposure: Schema.Number({ default: 0.8 }),
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
      const renderer = getComponent(rendererEntity, RendererComponent).renderer! as WebGLRenderer // todo
      renderer.shadowMap.type = component.shadowMapType
      renderer.shadowMap.needsUpdate = true
    }, [component.shadowMapType, rendererEntity])

    return null
  }
})
