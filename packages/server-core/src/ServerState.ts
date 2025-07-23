import { AppsV1Api, BatchV1Api, CoreV1Api, CustomObjectsApi } from '@kubernetes/client-node'

import { defineState } from '@ir-engine/hyperflux'

export const ServerMode = {
  API: 'API' as const,
  Instance: 'Instance' as const,
  Task: 'Task' as const
}

export type ServerTypeMode = (typeof ServerMode)[keyof typeof ServerMode]

export const ServerState = defineState({
  name: 'ServerState',
  initial: {
    k8AgonesClient: null! as CustomObjectsApi,
    k8DefaultClient: null! as CoreV1Api,
    k8AppsClient: null! as AppsV1Api,
    k8BatchClient: null! as BatchV1Api,
    agonesSDK: null! as Record<any, any>,
    serverMode: null! as ServerTypeMode
  }
})
