import { useEffect } from 'react'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, getComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { removeCallback, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'

import { Entity } from '@ir-engine/ecs/src/Entity'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
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

  schema: S.Object({
    src: S.String({ default: '' }),
    type: S.String({ default: '' }),
    isOpen: S.Bool({ default: false, serialized: false }),
    props: S.Any()
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
      if (overlayComponent.src.value) return
      if (overlayComponent.type.value !== 'iframe') return
      try {
        new URL(overlayComponent.src.value)
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
