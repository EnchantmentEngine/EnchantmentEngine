import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'
import type { WebContainer3D } from '@ir-engine/xrui'
import { useLayoutEffect } from 'react'

export const XRUIComponent = defineComponent({
  name: 'XRUIComponent',
  schema: Schema.Type<WebContainer3D>(),

  reactor: () => {
    const entity = useEntityContext()
    const xrui = useComponent(entity, XRUIComponent)

    useLayoutEffect(() => {
      return () => {
        xrui.destroy()
      }
    }, [])

    return null
  }
})
