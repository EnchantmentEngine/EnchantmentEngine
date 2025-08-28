import { getState } from '@ir-engine/hyperflux'
import config from '@ir-engine/server-core/src/appconfig'
import { default as multiLogger, default as serverLogger } from '@ir-engine/server-core/src/ServerLogger'
import { ServerState } from '@ir-engine/server-core/src/ServerState'

const logger = multiLogger.child({ component: 'taskserver:collect-events' })

const DEFAULT_INTERVAL_SECONDS = 60
const configInterval = parseInt(config['task-server'].processInterval)
const interval = (configInterval || DEFAULT_INTERVAL_SECONDS) * 1000

let lastTimestamp: string // Store the timestamp of the last run

const collectLogs = async () => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  logger.info('Collecting events at %s.', new Date().toString())

  if (k8DefaultClient) {
    try {
      const namespace = config.server.namespace // Replace with your target namespace
      const currentTimestamp = new Date().toISOString()
      let eventMessages: any[] = []

      // Fetch all events in the namespace
      const eventsResponse = await k8DefaultClient.listNamespacedEvent({
        namespace
      })

      logger.info(eventsResponse.items.length)
      if (lastTimestamp) {
        eventMessages = eventsResponse.items
          .filter((event) => {
            if (event.firstTimestamp) {
              new Date(event.firstTimestamp) > new Date(lastTimestamp)
            }
          })
          .map((event) => ({
            name: event.involvedObject.name,
            message: event.message,
            timestamp: event.firstTimestamp
          }))
      } else {
        eventMessages = eventsResponse.items.map((event) => ({
          name: event.involvedObject.name,
          message: event.message,
          timestamp: event.firstTimestamp
        }))
      }

      if (eventMessages.length > 0) {
        // Log the collected events
        logger.info(eventMessages)
      }

      lastTimestamp = currentTimestamp
    } catch (e) {
      serverLogger.error(e)
      return e
    }
  }
}

export default (app): void => {
  logger.info('started event logging.')

  setInterval(collectLogs, interval)

  collectLogs()
}
