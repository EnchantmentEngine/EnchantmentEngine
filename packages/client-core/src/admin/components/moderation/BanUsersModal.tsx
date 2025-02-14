/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { abuseReasons } from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { Select } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserSearchInput } from './common/UserSearchInput'

export const BanUsersModal = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation()
  const [selectedUser, setSelectedUser] = useState<UserType | undefined>(undefined)
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    onSubmit({
      selectedUser,
      reason
    })
    onClose()
    setReason('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="transform overflow-hidden rounded-lg shadow-xl transition-all sm:w-full sm:max-w-lg">
        <Modal
          title={t('admin:components.moderation.addUser')}
          onClose={onClose}
          closeButtonText={t('admin:components.moderation.cancel')}
          submitButtonText={t('admin:components.moderation.banUser')}
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <UserSearchInput onSelect={setSelectedUser} />
            <div>
              <label className="mb-1 block text-sm text-gray-400">{t('admin:components.moderation.uid')}</label>
              <input
                type="text"
                disabled={!!selectedUser}
                className="w-full rounded-lg bg-[#191b1f] px-3 py-2 text-white focus:outline-none focus:ring focus:ring-blue-500"
                placeholder={t('admin:components.moderation.uidPlaceholder')}
                value={selectedUser ? selectedUser?.id : ''}
              />
            </div>
            <div>
              <Select
                labelProps={{ text: t('admin:components.moderation.reason'), position: 'top' }}
                options={abuseReasons.map((reason) => ({ label: reason, value: reason }))}
                onChange={(e) => setReason(e as string)}
                width="full"
                value={reason}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
