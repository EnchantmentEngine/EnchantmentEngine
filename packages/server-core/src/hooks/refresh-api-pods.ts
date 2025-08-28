import { getState } from '@ir-engine/hyperflux'

import config from '../appconfig'
import logger from '../ServerLogger'
import { ServerState } from '../ServerState'

export default async () => {
  const k8AppsClient = getState(ServerState).k8AppsClient

  if (k8AppsClient) {
    try {
      logger.info('Attempting to refresh API pods')
      const refreshApiPodResponse = await k8AppsClient.patchNamespacedDeployment({
        name: `${config.server.releaseName}-ir-engine-api`,
        namespace: config.server.namespace,
        body: {
          spec: {
            template: {
              metadata: {
                annotations: {
                  'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
                }
              }
            }
          }
        }
      })
      logger.info(refreshApiPodResponse, 'updateBuilderTagResponse')
    } catch (e) {
      logger.error(e)
      return e
    }
  }
}
