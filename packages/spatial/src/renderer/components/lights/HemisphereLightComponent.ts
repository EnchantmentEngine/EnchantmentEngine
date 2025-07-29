import { useEffect } from 'react'
import { HemisphereLight } from 'three'

import { S, defineComponent, removeComponent, setComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { NO_PROXY, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'

import { T } from '../../../schema/schemaFunctions'
import { ObjectComponent } from '../ObjectComponent'
import { LightTagComponent } from './LightTagComponent'

export const HemisphereLightComponent = defineComponent({
  name: 'HemisphereLightComponent',
  jsonID: 'EE_hemisphere_light',

  schema: S.Object({
    skyColor: T.Color(0xffffff),
    groundColor: T.Color(0xffffff),
    intensity: S.Number({ default: 1 })
  }),

  reactor: function () {
    const entity = useEntityContext()
    const hemisphereLightComponent = useComponent(entity, HemisphereLightComponent)
    const light = useHookstate(() => new HemisphereLight()).get(NO_PROXY) as HemisphereLight

    useImmediateEffect(() => {
      setComponent(entity, LightTagComponent)
      setComponent(entity, ObjectComponent, light)
      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    useEffect(() => {
      light.groundColor.set(hemisphereLightComponent.groundColor)
    }, [hemisphereLightComponent.groundColor])

    useEffect(() => {
      light.intensity = hemisphereLightComponent.intensity
    }, [hemisphereLightComponent.intensity])

    useEffect(() => {
      light.color.set(hemisphereLightComponent.skyColor)
    }, [hemisphereLightComponent.skyColor])

    return null
  }
})
