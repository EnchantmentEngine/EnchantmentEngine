import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineRemoveCircleOutline } from 'react-icons/md'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { ProjectService } from '@ir-engine/client-core/src/common/services/ProjectService'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { useFind } from '@ir-engine/common'
import {
  InviteCode,
  ProjectPermissionType,
  ProjectType,
  ScopeType,
  projectPermissionPath,
  scopePath
} from '@ir-engine/common/src/schema.type.module'
import { EngineState } from '@ir-engine/ecs'
import { ImmutableObject, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { Button, Input } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'

export default function ManageUserPermissionModal({ project }: { project: ImmutableObject<ProjectType> }) {
  const { t } = useTranslation()
  const selfUser = useHookstate(getMutableState(AuthState)).user
  const userInviteCode = useHookstate('' as InviteCode)
  const userInviteCodeError = useHookstate(undefined)

  const scopeQuery = useFind(scopePath, {
    query: {
      userId: getState(EngineState).userID,
      type: 'admin:admin' as ScopeType
    }
  })

  const userHasAccess = scopeQuery.data.length > 0

  const selfUserPermission =
    project?.projectPermissions?.find((permission) => permission.userId === selfUser.id.value)?.type === 'owner' ||
    userHasAccess
      ? 'owner'
      : 'user'

  const projectPermissionsFindQuery = useFind(projectPermissionPath, {
    query: {
      projectId: project.id,
      paginate: false
    }
  })

  const handleCreatePermission = async () => {
    if (!userInviteCode.value) {
      userInviteCodeError.set(t('admin:components.project.inviteCodeCantEmpty'))
      return
    }
    try {
      await ProjectService.createPermission(userInviteCode.value, project.id, 'editor')
      projectPermissionsFindQuery.refetch()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handlePatchPermission = async (permission: ProjectPermissionType) => {
    try {
      await ProjectService.patchPermission(permission.id, permission.type === 'owner' ? 'editor' : 'owner')
      projectPermissionsFindQuery.refetch()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handleRemovePermission = async (id: string) => {
    try {
      await ProjectService.removePermission(id)
      projectPermissionsFindQuery.refetch()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  return (
    <Modal
      title={t('admin:components.project.userAccess')}
      className="w-[50vw] max-w-2xl"
      onSubmit={() => {
        handleCreatePermission()
      }}
      hideFooter={selfUserPermission !== 'owner'}
      onClose={() => ModalState.closeModal()}
    >
      {selfUserPermission === 'owner' && (
        <Input
          labelProps={{
            text: t('admin:components.project.userInviteCode'),
            position: 'top'
          }}
          value={userInviteCode.value}
          onChange={(event) => userInviteCode.set(event.target.value as InviteCode)}
          helperText={userInviteCodeError.value}
          state={userInviteCodeError.value ? 'error' : undefined}
        />
      )}
      <div className="grid gap-4">
        {projectPermissionsFindQuery.data.map((permission) => (
          <div key={permission.id} className="flex items-center gap-2">
            <Text fontSize="sm">
              {permission.userId === selfUser.id.value ? `${permission.user?.name} (you)` : permission.user?.name}
            </Text>
            <Text fontSize="sm" theme="secondary">
              {permission.type}
            </Text>
            <Toggle
              value={permission.type === 'owner'}
              onChange={() => handlePatchPermission(permission)}
              disabled={
                selfUserPermission !== 'owner' ||
                selfUser.id.value === permission.userId ||
                projectPermissionsFindQuery.data.length === 1
              }
            />
            <Button title="Remove Access" onClick={() => handleRemovePermission(permission.id)}>
              <MdOutlineRemoveCircleOutline />
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  )
}
