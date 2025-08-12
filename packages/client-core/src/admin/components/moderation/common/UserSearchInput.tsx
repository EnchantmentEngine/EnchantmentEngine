import { useFind } from '@ir-engine/common'
import { userPath } from '@ir-engine/common/src/schema.type.module'
import { Select } from '@ir-engine/ui'
import { OptionType } from '@ir-engine/ui/src/primitives/tailwind/Select'
import { debounce } from 'lodash-es'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const UserSearchInput = ({ onSelect }) => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const debouncedSetSearchTerm = debounce(setDebouncedSearchTerm, 500)

  useEffect(() => {
    debouncedSetSearchTerm(searchTerm)
    setSearchTerm(searchTerm)
  }, [searchTerm])

  const { data: users, status } = useFind(userPath, {
    query: {
      name: { $like: `%${debouncedSearchTerm}%` },
      $limit: 10
    }
  })

  const options: OptionType[] = users.map((user) => ({
    value: user.id,
    label: user.name
  }))

  const handleSelect = (value) => {
    const selectedUser = users.find((user) => user.id === value)
    onSelect(selectedUser)
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-gray-400">{t('admin:components.moderation.username')}</label>
      <Select
        options={options}
        value={searchTerm}
        onInputChange={(value) => setSearchTerm(value)}
        onChange={handleSelect}
        searchMode="substring"
        width="full"
        inputHeight="l"
        helperText={t('admin:components.moderation.userBannedSelectUserHelperText')}
      />
    </div>
  )
}
