import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LuInfo } from 'react-icons/lu'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { ProjectService, ProjectState } from '@ir-engine/client-core/src/common/services/ProjectService'
import { useFind } from '@ir-engine/common'
import { DefaultUpdateSchedule } from '@ir-engine/common/src/interfaces/ProjectPackageJsonType'
import { ProjectType, ScopeType, engineSettingPath, scopePath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { Checkbox, Select } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { Engine } from '@ir-engine/ecs'
import { AuthState } from '../../../user/services/AuthService'
import { ProjectUpdateService, ProjectUpdateState } from '../../services/ProjectUpdateService'
import AddEditProjectModal from './AddEditProjectModal'

const getDefaultErrors = () => ({
  serverError: ''
})

export default function UpdateEngineModal() {
  const { t } = useTranslation()
  const helmSettings = useFind(engineSettingPath, {
    query: {
      category: 'helm',
      paginate: false
    }
  }).data

  const helmBuilder = helmSettings.find((setting) => setting.key == EngineSettings.Helm.Main)?.value
  const helmMain = helmSettings.find((setting) => setting.key === EngineSettings.Helm.Builder)?.value
  const projectState = useMutableState(ProjectState)
  const projectUpdateStatus = useMutableState(ProjectUpdateState)
  const engineCommit = projectState.builderInfo.engineCommit.value

  const updateProjects = useHookstate(false)
  const selectedCommitTag = useHookstate('')
  const modalProcessing = useHookstate(false)
  const projectsToUpdate = useHookstate(new Set<string>())
  const errors = useHookstate(getDefaultErrors())
  const authState = useMutableState(AuthState)
  const user = authState.user

  const scopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.userID,
      type: 'projects:read' as ScopeType
    }
  })

  useEffect(() => {
    if (scopeQuery.data.length > 0) {
      ProjectService.fetchBuilderTags()
      ProjectService.getBuilderInfo()
    }
  }, [scopeQuery.data.length > 0])

  const selectCommitTagOptions = projectState.builderTags.value.map((builderTag) => {
    const pushedDate = toDisplayDateTime(builderTag.pushedAt)
    const label = `Commit ${builderTag.commitSHA?.slice(0, 8)}`

    let secondaryText = ''

    if (builderTag.tag === engineCommit) {
      secondaryText += `Current`
    }

    if (secondaryText.length > 0) secondaryText += ' • '

    secondaryText += `Version ${builderTag.engineVersion} • Pushed ${pushedDate}`

    return {
      value: builderTag.tag,
      label,
      secondaryText
    }
  })

  const addOrRemoveProjectsToUpdate = (project: ProjectType, value: boolean) => {
    if (value) {
      ProjectUpdateService.initializeProjectUpdate(project.name)
      ProjectUpdateService.setTriggerSetDestination(
        project.name,
        project.repositoryPath,
        project.updateType,
        project.updateSchedule
      )
      ModalState.openModal(
        <AddEditProjectModal
          inputProject={project}
          update={true}
          onSubmit={async () => {
            projectsToUpdate.set((set) => {
              set.add(project.name)
              return set
            })
            ModalState.closeModal()
          }}
        />
      )
    } else {
      ProjectUpdateService.clearProjectUpdate(project.name)
      projectsToUpdate.set((set) => {
        set.delete(project.name)
        return set
      })
    }
  }

  const handleSubmit = async () => {
    modalProcessing.set(true)
    errors.set(getDefaultErrors())
    try {
      await ProjectService.updateEngine(
        selectedCommitTag.value,
        updateProjects.value,
        Object.keys(projectUpdateStatus.value).map((name) => {
          return {
            name: projectUpdateStatus[name].projectName.value,
            sourceURL: projectUpdateStatus[name].sourceURL.value,
            destinationURL: projectUpdateStatus[name].destinationURL.value,
            reset: true,
            commitSHA: projectUpdateStatus[name].selectedSHA.value,
            sourceBranch: projectUpdateStatus[name].selectedBranch.value,
            updateType: projectUpdateStatus[name].updateType.value || ('none' as ProjectType['updateType']),
            updateSchedule: projectUpdateStatus[name].updateSchedule.value || DefaultUpdateSchedule
          }
        })
      )
      ModalState.closeModal()
    } catch (err) {
      errors.set(err.message)
    }
    modalProcessing.set(false)
    ModalState.closeModal()
  }

  useEffect(() => {
    if (engineCommit) selectedCommitTag.set(engineCommit)
  }, [engineCommit])

  return (
    <Modal
      title={t('admin:components.project.updateEngine')}
      onSubmit={handleSubmit}
      className="w-[50vw]"
      onClose={ModalState.closeModal}
      submitLoading={modalProcessing.value}
    >
      <div className="grid gap-6">
        {errors.serverError.value && <p className="mb-3 text-red-700">{errors.serverError.value}</p>}
        <Text>
          {t('admin:components.setting.helm.mainHelmToDeploy')}:{' '}
          <a href="/admin/settings#helm">{helmMain || 'Current Version'}</a>
        </Text>
        <Text>
          {t('admin:components.setting.helm.builderHelmToDeploy')}:{' '}
          <a href="/admin/settings#helm">{helmBuilder || 'Current Version'}</a>
        </Text>
        <Select
          labelProps={{
            text: t('admin:components.project.commitData'),
            position: 'top'
          }}
          positioning={{
            maxHeight: '200px'
          }}
          options={selectCommitTagOptions}
          value={selectedCommitTag.value}
          onChange={(value: string) => {
            selectedCommitTag.set(value)
          }}
          disabled={modalProcessing.value}
          showClearButton={true}
          width="full"
        />
        <Checkbox
          checked={updateProjects.value}
          onChange={updateProjects.set}
          label={t('admin:components.project.updateSelector')}
          disabled={modalProcessing.value}
        />

        {updateProjects.value && (
          <>
            <div className="flex items-center justify-center gap-3 rounded-lg  p-4">
              <div>
                <LuInfo className="h-5 w-5 bg-transparent" />
              </div>
              <Text>{t('admin:components.project.projectWarning')}</Text>
            </div>
            <div className="grid gap-2">
              {projectState.projects.value
                .filter((project) => project.name !== 'ir-engine/default-project' && project.repositoryPath)
                .map((project) => (
                  <div key={project.id} className="border   px-3.5 py-5">
                    <Checkbox
                      label={project.name}
                      checked={projectsToUpdate.value.has(project.name)}
                      disabled={modalProcessing.value}
                      onChange={(value) => addOrRemoveProjectsToUpdate(project as ProjectType, value)}
                    />
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
