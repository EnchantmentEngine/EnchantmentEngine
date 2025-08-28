import { updateAppConfig } from '@ir-engine/server-core/src/updateAppConfig'

const init = async () => {
  await updateAppConfig()
  const { start } = await import('./start')
  start()
}
init()
