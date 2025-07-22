import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiArrowPath, HiPlus } from 'react-icons/hi2'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { ProjectService, ProjectState } from '@ir-engine/client-core/src/common/services/ProjectService'
import config from '@ir-engine/common/src/config'
import { NO_PROXY, getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

import { useFind } from '@ir-engine/common'
import { identityProviderPath } from '@ir-engine/common/src/schema.type.module'
import { Button } from '@ir-engine/ui'
import { ProjectUpdateState } from '../../services/ProjectUpdateService'
import AddEditProjectModal from './AddEditProjectModal'
import UpdateEngineModal from './UpdateEngineModal'

export default function ProjectTopMenu() {
  const { t } = useTranslation()
  const projectState = useMutableState(ProjectState)
  const modalProcessing = useHookstate(false)

  ProjectService.useAPIListeners()

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (projectState.rebuilding.value) {
      interval = setInterval(ProjectService.checkReloadStatus, 10000)
    } else {
      if (interval) clearInterval(interval)
      ProjectService.fetchProjects()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [projectState.rebuilding.value])

  const handleSubmit = async () => {
    const projectUpdateStatus = getMutableState(ProjectUpdateState)['tempProject'].get(NO_PROXY)
    try {
      await ProjectService.uploadProject({
        sourceURL: projectUpdateStatus.sourceURL,
        destinationURL: projectUpdateStatus.destinationURL,
        name: projectUpdateStatus.projectName,
        reset: true,
        commitSHA: projectUpdateStatus.selectedSHA,
        sourceBranch: projectUpdateStatus.selectedBranch,
        updateType: projectUpdateStatus.updateType,
        updateSchedule: projectUpdateStatus.updateSchedule
      })
      ModalState.closeModal()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const identityProvidersQuery = useFind(identityProviderPath)
  const githubProvider = identityProvidersQuery.data.find((ip) => ip.type === 'github')

  const refreshGithubRepoAccess = () => {
    ProjectService.refreshGithubRepoAccess()
  }

  return (
    <div className="mb-4 flex justify-between gap-2">
      <div className="flex gap-2">
        {githubProvider != null && (
          <Button
            size="sm"
            disabled={projectState.refreshingGithubRepoAccess.value}
            onClick={() => refreshGithubRepoAccess()}
            className="[&>*]:m-0"
          >
            {projectState.refreshingGithubRepoAccess.value ? (
              <span className="flex items-center gap-2">
                <LoadingView spinnerOnly className="inline-block h-6 w-6" />
                {t('admin:components.project.refreshingGithubRepoAccess')}
              </span>
            ) : (
              t('admin:components.project.refreshGithubRepoAccess')
            )}
          </Button>
        )}

        <Button
          size="sm"
          onClick={() => {
            ModalState.openModal(<UpdateEngineModal />)
          }}
          disabled={config.client.localBuildOrDev}
        >
          <HiArrowPath />
          {!config.client.localBuildOrDev && projectState.rebuilding.value
            ? t('admin:components.project.rebuilding')
            : t('admin:components.project.updateAndRebuild')}
          {!config.client.localBuildOrDev && projectState.rebuilding.value ? (
            <LoadingView spinnerOnly className="h-6 w-6" />
          ) : undefined}
        </Button>
        <Button
          size="sm"
          onClick={() => {
            ModalState.openModal(<AddEditProjectModal onSubmit={handleSubmit} update={false} />)
          }}
        >
          <HiPlus />
          {t('admin:components.project.addProject')}
        </Button>
      </div>
    </div>
  )
}
