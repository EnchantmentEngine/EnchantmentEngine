import { API } from '@ir-engine/common'
import multiLogger from '@ir-engine/common/src/logger'
import { oembedPath, OembedType } from '@ir-engine/common/src/schema.type.module'
import { defineState, getMutableState } from '@ir-engine/hyperflux'

import { NotificationService } from './NotificationService'

const logger = multiLogger.child({ component: 'client-core:OEmbedService' })

export const OEmbedState = defineState({
  name: 'OEmbedState',
  initial: () => ({
    oEmbed: undefined as OembedType | undefined,
    pathname: ''
  }),

  fetchData: async (pathname: string, queryUrl: string) => {
    try {
      getMutableState(OEmbedState).merge({ oEmbed: undefined, pathname })
      const oEmbed = (await API.instance.service(oembedPath).find({ query: { url: queryUrl } })) as OembedType
      getMutableState(OEmbedState).merge({ oEmbed, pathname })
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
})
