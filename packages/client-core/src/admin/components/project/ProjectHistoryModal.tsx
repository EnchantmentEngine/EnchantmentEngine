import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ModalState } from '../../../common/services/ModalState'
import { ProjectHistory } from './ProjectHistory'

export const ProjectHistoryModal = ({ projectId, projectName }: { projectId: string; projectName: string }) => {
  const { t } = useTranslation()
  return (
    <Modal
      className="relative max-h-full w-[75vw] p-4"
      title={t('admin:components.project.projectHistory')}
      onClose={() => {
        ModalState.closeModal()
      }}
    >
      <ProjectHistory projectId={projectId} projectName={projectName} />
    </Modal>
  )
}
