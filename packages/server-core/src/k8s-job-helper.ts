import { apiJobPath } from '@ir-engine/common/src/schemas/cluster/api-job.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { getState } from '@ir-engine/hyperflux'
import { V1Job } from '@kubernetes/client-node'
import { Application } from '../declarations'
import { ServerState } from './ServerState'
import config from './appconfig'
import { getPodsData } from './cluster/pods/pods-helper'

export const createExecutorJob = async (
  app: Application,
  jobBody: V1Job,
  jobLabelSelector: string,
  timeout: number,
  jobId: string,
  waitForFinish = true
) => {
  const k8BatchClient = getState(ServerState).k8BatchClient

  const name = jobBody.metadata!.name!
  try {
    await k8BatchClient.deleteNamespacedJob({
      name,
      namespace: config.server.namespace,
      gracePeriodSeconds: 0,
      propagationPolicy: 'Background'
    })
  } catch (err) {
    console.log('Old job did not exist, continuing...')
  }

  await k8BatchClient.createNamespacedJob({ namespace: config.server.namespace, body: jobBody })
  let counter = 0
  return new Promise((resolve, reject) => {
    if (!waitForFinish) resolve({})
    const interval = setInterval(async () => {
      counter++

      const job = await app.service(apiJobPath).get(jobId)
      console.log('job to be checked on', job, job.status, counter)
      if (job.status !== 'pending') clearInterval(interval)
      if (job.status === 'succeeded') resolve(job.returnData)
      if (job.status === 'failed') reject(job.returnData)
      if (counter >= timeout) {
        clearInterval(interval)
        const date = await getDateTimeSql()
        await app.service(apiJobPath).patch(jobId, {
          status: 'failed',
          endTime: date
        })
        reject('Job timed out; try again later or check error logs of job')
      }
    }, 1000)
  })
}

export async function getJobBody(
  app: Application,
  command: string[],
  name: string,
  labels: { [key: string]: string },
  ttlSecondsAfterFinished = 86400 // This value is 1 day
): Promise<V1Job> {
  const apiPods = await getPodsData(
    `app.kubernetes.io/instance=${config.server.releaseName},app.kubernetes.io/component=api`,
    'api',
    'Api',
    app
  )

  const image = apiPods.pods[0].containers.find((container) => container.name === 'ir-engine')!.image

  // Add this label to the job so that we can identify pods for a job
  labels['ir-engine/isJob'] = 'true'

  name = getValidPodName(name)

  const jobSpec: V1Job = {
    metadata: {
      name,
      labels
    },
    spec: {
      ttlSecondsAfterFinished,
      template: {
        metadata: {
          labels
        },
        spec: {
          serviceAccountName: `${process.env.RELEASE_NAME}-ir-engine-api`,
          restartPolicy: 'Never',
          containers: [
            {
              name,
              image,
              imagePullPolicy: 'IfNotPresent',
              command,
              env: Object.entries(process.env).map(([key, value]) => {
                return { name: key, value: value }
              }),
              resources: {
                requests: {
                  'ephemeral-storage': '8Gi'
                },
                limits: {
                  'ephemeral-storage': '8Gi'
                }
              }
            }
          ]
        }
      }
    }
  }

  // Only add initContainer if GOOGLE_PROJECT_ID is not an empty string
  if (process.env.GOOGLE_PROJECT_ID) {
    jobSpec.spec!.template.spec!.initContainers = [
      {
        name: 'cloud-sql-proxy',
        image: 'gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.14.1',
        restartPolicy: 'Always',
        args: [
          '--private-ip',
          '--structured-logs',
          '--port=3306',
          '--auto-iam-authn',
          `${process.env.GOOGLE_PROJECT_ID}:us-central1:${process.env.NAMESPACE}-mysql`
        ],
        securityContext: {
          runAsNonRoot: true
        }
      }
    ]
  }

  return jobSpec
}

/**
 * K8s will add characters onto the name when making the pod, and names can be max 63 characters.
 * Trim the name to ensure it will be under that limit
 * @param name
 * @returns
 */
export function getValidPodName(name: string) {
  let sliced = name.slice(0, 52)
  if (!/[a-zA-Z0-9]/.test(sliced[sliced.length - 1])) sliced = sliced.slice(0, sliced.length - 1)
  return sliced
}
