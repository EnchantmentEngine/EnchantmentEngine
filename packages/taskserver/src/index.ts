// required for hookstate to override react properly work - see https://github.com/avkonst/hookstate/issues/412
import '@ir-engine/hyperflux'

import { updateAppConfig } from '@ir-engine/server-core/src/updateAppConfig'

const init = async () => {
  await updateAppConfig()
  const { start } = await import('./start')
  start()
}
init()
