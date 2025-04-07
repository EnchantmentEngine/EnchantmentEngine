import { defineSystem, useEntityContext, useOptionalComponent } from '@ir-engine/ecs'
import { QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { LinkComponent } from '@ir-engine/engine/src/scene/components/LinkComponent'
import { removeError } from '@ir-engine/engine/src/scene/functions/ErrorFunctions'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { NotificationService } from '../common/services/NotificationService'

const LINK_ERROR_TYPE = 'WINDOW_BLOCKED'

const LinkErrorReactor = () => {
  const entity = useEntityContext()
  const errorComponent = useOptionalComponent(entity, ErrorComponent)
  const { t } = useTranslation()

  useEffect(() => {
    const linkErrors = errorComponent?.[LinkComponent.name].value
    if (linkErrors?.[LINK_ERROR_TYPE]) {
      NotificationService.dispatchNotify(t('user:common.windowBlocked'), { variant: 'error' })
      removeError(entity, LinkComponent, LINK_ERROR_TYPE)
    }
  }, [errorComponent?.[LinkComponent.name].value])

  return null
}

export const LinkErrorSystem = defineSystem({
  uuid: 'ee.client.LinkErrorSystem',
  insert: {},
  reactor: () => <QueryReactor Components={[ErrorComponent, LinkComponent]} ChildEntityReactor={LinkErrorReactor} />
})
