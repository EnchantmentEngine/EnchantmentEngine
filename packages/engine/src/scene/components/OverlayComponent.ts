import { useEffect } from 'react'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, getComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { removeCallback, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'

import { Entity } from '@ir-engine/ecs/src/Entity'
import { Schema } from '@ir-engine/hyperflux'
import { addError, clearErrors } from '../functions/ErrorFunctions'

const interactMessage = 'Click'
const overlayCallbackName = 'onOpenMenu'

const toggleOpen = (overlayEntity: Entity) => {
  const overlayComponent = getComponent(overlayEntity, OverlayComponent)
  setComponent(overlayEntity, OverlayComponent, { isOpen: !overlayComponent.isOpen })
}

export const OverlayComponent = defineComponent({
  name: 'OverlayComponent',
  jsonID: 'IR_overlay_component',

  schema: Schema.Object({
    src: Schema.String({ default: '' }),
    type: Schema.String({ default: '' }),
    isOpen: Schema.Bool({ default: false, serialized: false }),
    props: Schema.Any()
  }),

  overlayCallbackName,
  interactMessage,
  toggleOpen,

  errors: ['INVALID_URL'],

  reactor: function () {
    const entity = useEntityContext()
    const overlayComponent = useComponent(entity, OverlayComponent)

    useEffect(() => {
      clearErrors(entity, OverlayComponent)
      if (overlayComponent.src) return
      if (overlayComponent.type !== 'iframe') return
      try {
        new URL(overlayComponent.src)
      } catch {
        return addError(entity, OverlayComponent, 'INVALID_URL', 'Please enter a valid URL.')
      }
      return
    }, [overlayComponent.src])

    useEffect(() => {
      setCallback(entity, overlayCallbackName, () => toggleOpen(entity))
      return () => {
        removeCallback(entity, overlayCallbackName)
      }
    }, [])

    return null
  }
})
