import { useEffect } from 'react'
import { Vector3 } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineState, getState, isClient } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { EngineState } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { isMobile, isSafari } from '@ir-engine/spatial/src/common/functions/isMobile'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { addError, clearErrors } from '../functions/ErrorFunctions'

const linkLogic = (linkEntity: Entity, xrState) => {
  if (getState(EngineState).isEditing) return
  const linkComponent = getComponent(linkEntity, LinkComponent)
  // if (!linkComponent.sceneNav) {
  //   xrState && xrState.session?.end()
  //   typeof window === 'object' && window && window.open(linkComponent.url, '_blank')
  // } else {
  //   getMutableState(LinkState).location.set(linkComponent.location)
  // }
  xrState && xrState.session?.end()
  if (typeof window === 'object' && window && linkComponent.newTab) {
    const windoOpen = window.open(linkComponent.url, '_blank')
    //this error added when safari blocks new window
    if (!windoOpen && isMobile && isSafari) {
      addError(linkEntity, LinkComponent, 'WINDOW_BLOCKED', 'Unable to open link in new tab.')
    }
  } else {
    window.location.href = linkComponent.url
  }
}
const linkCallback = (linkEntity: Entity) => {
  console.log('linkCallback')
  const buttons = InputComponent.getButtons(linkEntity)
  if (buttons.XRStandardGamepadTrigger?.down) {
    const xrState = getState(XRState)
    linkLogic(linkEntity, xrState)
  } else {
    linkLogic(linkEntity, undefined)
  }
}

const vec3 = new Vector3()
const interactMessage = 'Click to follow'
const linkCallbackName = 'linkCallback'

export const LinkState = defineState({
  name: 'LinkState',
  initial: {
    location: undefined as undefined | string
  }
})

export const LinkComponent = defineComponent({
  name: 'LinkComponent',
  jsonID: 'EE_link',

  schema: S.Object({
    url: S.String(),
    sceneNav: S.Bool(),
    location: S.String(),
    newTab: S.Bool({ default: true })
  }),

  linkCallbackName,
  linkCallback,
  interactMessage,

  errors: ['INVALID_URL', 'WINDOW_BLOCKED'],

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const link = useComponent(entity, LinkComponent)

    useEffect(() => {
      clearErrors(entity, LinkComponent)
      if (link.sceneNav) return
      try {
        new URL(link.url)
      } catch {
        return addError(entity, LinkComponent, 'INVALID_URL', 'Please enter a valid URL.')
      }
      return
    }, [link.url, link.sceneNav])

    useEffect(() => {
      setCallback(entity, linkCallbackName, () => LinkComponent.linkCallback(entity))
    }, [])

    return null
  }
})
