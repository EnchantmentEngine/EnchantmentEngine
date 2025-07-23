import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import type { WebContainer3D } from '@ir-engine/xrui'
import { useLayoutEffect } from 'react'

export const XRUIComponent = defineComponent({
  name: 'XRUIComponent',
  schema: S.Type<WebContainer3D>(),

  reactor: () => {
    const entity = useEntityContext()
    const xruiComponent = useComponent(entity, XRUIComponent)

    useLayoutEffect(() => {
      const xrui = xruiComponent.value
      return () => {
        xrui.destroy()
      }
    }, [])

    return null
  }
})
