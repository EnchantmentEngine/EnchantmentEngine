import { SpawnTestBot, TestBot } from '@ir-engine/common/src/interfaces/TestBot'
import { getState } from '@ir-engine/hyperflux'
import config from '@ir-engine/server-core/src/appconfig'
import serverLogger from '@ir-engine/server-core/src/ServerLogger'

import { Application } from '../../../declarations'
import { ServerState } from '../../ServerState'

export const getTestbotPod = async (app: Application) => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const jobName = `${config.server.releaseName}-ir-engine-testbot`
      const podsResult = await k8DefaultClient.listNamespacedPod({
        namespace: config.server.namespace
      })
      let pods: TestBot[] = []
      for (const pod of podsResult.items) {
        let labels = pod.metadata!.labels
        if (labels && labels['job-name'] && labels['job-name'] === jobName) {
          pods.push({
            name: pod.metadata!.name!,
            status: pod.status!.phase!
          })
        }
      }
      return pods
    } catch (e) {
      serverLogger.error(e)
      return e
    }
  }
}

/**
 * Reference:
 * https://serverfault.com/a/888819
 * https://stackoverflow.com/a/61864881
 * @param app
 * @returns
 */
export const runTestbotJob = async (app: Application): Promise<SpawnTestBot> => {
  const k8BatchClient = getState(ServerState).k8BatchClient
  if (k8BatchClient) {
    try {
      const jobName = `${config.server.releaseName}-ir-engine-testbot`
      const oldJobResult = await k8BatchClient.readNamespacedJob({ name: jobName, namespace: config.server.namespace })

      if (oldJobResult) {
        // Removed unused properties
        delete oldJobResult.metadata!.managedFields
        delete oldJobResult.metadata!.resourceVersion
        delete oldJobResult.spec!.selector
        delete oldJobResult.spec!.template!.metadata!.labels

        oldJobResult.spec!.suspend = false

        const deleteJobResult = await k8BatchClient.deleteNamespacedJob({
          name: jobName,
          namespace: config.server.namespace,
          gracePeriodSeconds: 0,
          propagationPolicy: 'Background'
        })

        if (deleteJobResult.status === 'Success') {
          await k8BatchClient.createNamespacedJob({ namespace: config.server.namespace, body: oldJobResult })

          return { status: true, message: 'Bot spawned successfully' }
        }
      }
    } catch (e) {
      serverLogger.error(e)
      return { status: false, message: `Failed to spawn bot. (${e.reason})` }
    }
  }

  return { status: false, message: 'Failed to spawn bot' }
}
