import React, { useEffect } from 'react'

import {
  Entity,
  PresentationSystemGroup,
  QueryReactor,
  removeComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'

import { defineMaterialPlugin } from '@ir-engine/spatial'
import { MaterialComponent } from '@ir-engine/spatial/src/materials/MaterialComponent'
import { FogSettingsComponent, FogType } from '@ir-engine/spatial/src/renderer/components/FogSettingsComponent'

export const FogShaderPluginComponent = defineMaterialPlugin({
  name: 'FogShaderPluginComponent',

  jsonID: 'IR_fog_shader',

  uniforms: S.Object({
    fogTime: S.Number(),
    fogTimeScale: S.Number({ default: 1 }),
    heightFactor: S.Number({ default: 0.05 })
  }),

  onApply(entity, shader, renderer) {},

  update: (component, deltaSeconds) => {
    component.fogTime += deltaSeconds
  }
})

function FogGroupReactor(props: { entity: Entity; fogEntity: Entity }) {
  const { entity, fogEntity } = props
  const fogSettings = useComponent(fogEntity, FogSettingsComponent)

  useEffect(() => {
    setComponent(entity, FogShaderPluginComponent)
    return () => {
      removeComponent(entity, FogShaderPluginComponent)
    }
  }, [])

  useEffect(() => {
    setComponent(entity, FogShaderPluginComponent, { heightFactor: fogSettings.height })
  }, [fogSettings.height])

  useEffect(() => {
    setComponent(entity, FogShaderPluginComponent, { fogTimeScale: fogSettings.timeScale })
  }, [fogSettings.timeScale])

  return null
}

const FogReactor = () => {
  const entity = useEntityContext()
  const fogComponent = useComponent(entity, FogSettingsComponent)
  if (fogComponent.type !== FogType.Brownian && fogComponent.type !== FogType.Height) return null
  return (
    <QueryReactor
      ChildEntityReactor={FogGroupReactor}
      Components={[MaterialComponent, VisibleComponent]}
      props={{ fogEntity: entity }}
    />
  )
}

const reactor = () => {
  // TODO support multiple fog entities via spatial queries
  return <QueryReactor ChildEntityReactor={FogReactor} Components={[FogSettingsComponent]} />
}

export const FogSystem = defineSystem({
  uuid: 'ee.engine.FogSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
