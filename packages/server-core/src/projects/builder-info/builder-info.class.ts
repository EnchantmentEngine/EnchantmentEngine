import { ServiceInterface } from '@feathersjs/feathers'

import { BuilderInfoType } from '@ir-engine/common/src/schemas/projects/builder-info.schema'
import { getState } from '@ir-engine/hyperflux'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { ServerState } from '../../ServerState'
import {
  dockerHubRegex,
  engineVersion,
  gcpArtifactRegistryTagRegex,
  privateECRTagRegex,
  publicECRTagRegex
} from '../project/project-helper'

export class BuilderInfoService implements ServiceInterface<BuilderInfoType> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get() {
    const returned: BuilderInfoType = {
      engineVersion: engineVersion || '',
      engineCommit: ''
    }
    const k8AppsClient = getState(ServerState).k8AppsClient
    const k8BatchClient = getState(ServerState).k8BatchClient

    if (k8AppsClient) {
      const builderLabelSelector = `app.kubernetes.io/instance=${config.server.releaseName}-builder`

      const builderJob = await k8BatchClient.listNamespacedJob({
        namespace: config.server.namespace,
        labelSelector: builderLabelSelector
      })

      let builderContainer
      if (builderJob && builderJob.items.length > 0) {
        builderContainer = builderJob?.items[0]?.spec?.template?.spec?.containers?.find(
          (container) => container.name === 'ir-engine-builder'
        )
      } else {
        const builderDeployment = await k8AppsClient.listNamespacedDeployment({
          namespace: config.server.namespace,
          pretty: 'false',
          labelSelector: builderLabelSelector
        })
        builderContainer = builderDeployment?.items[0]?.spec?.template?.spec?.containers?.find(
          (container) => container.name === 'ir-engine-builder'
        )
      }
      if (builderContainer) {
        const image = builderContainer.image
        if (image && typeof image === 'string') {
          const dockerHubRegexExec = dockerHubRegex.exec(image)
          const publicECRRegexExec = publicECRTagRegex.exec(image)
          const privateECRRegexExec = privateECRTagRegex.exec(image)
          const gcpArtifactRegistryRegexExec = gcpArtifactRegistryTagRegex.exec(image)
          returned.engineCommit =
            dockerHubRegexExec && !publicECRRegexExec
              ? dockerHubRegexExec[1]
              : publicECRRegexExec
              ? publicECRRegexExec[1]
              : privateECRRegexExec
              ? privateECRRegexExec[2]
              : gcpArtifactRegistryRegexExec
              ? gcpArtifactRegistryRegexExec[5] || gcpArtifactRegistryRegexExec[6] || ''
              : ''
        }
      }
    }
    return returned
  }
}
