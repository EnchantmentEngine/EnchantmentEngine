import { useEffect } from 'react'
import { AmbientLight } from 'three'

import { defineComponent, removeComponent, setComponent, useComponent, useEntityContext } from '@ir-engine/ecs'

import { Schema, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import { T } from '../../../schema/schemaFunctions'
import { ObjectComponent } from '../ObjectComponent'
import { LightTagComponent } from './LightTagComponent'

export const AmbientLightComponent = defineComponent({
  name: 'AmbientLightComponent',
  jsonID: 'EE_ambient_light',

  schema: Schema.Object({
    color: T.Color(0xffffff),
    intensity: Schema.Number({ default: 1 })
  }),

  reactor: function () {
    const entity = useEntityContext()
    const ambientLightComponent = useComponent(entity, AmbientLightComponent)
    const light = useHookstate(() => new AmbientLight()).value as AmbientLight

    useImmediateEffect(() => {
      setComponent(entity, LightTagComponent)
      setComponent(entity, ObjectComponent, light)
      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    useEffect(() => {
      light.color.set(ambientLightComponent.color)
    }, [ambientLightComponent.color])

    useEffect(() => {
      light.intensity = ambientLightComponent.intensity
    }, [ambientLightComponent.intensity])

    return null
  }
})
