import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { State } from '@ir-engine/hyperflux'

import { SearchSmSm, XCircleLg } from '@ir-engine/ui/src/icons'
import Input, { InputProps } from '@ir-engine/ui/src/primitives/tailwind/Input'

export default function SearchBar({
  search,
  size = 'l',
  inputProps = {},
  debounceTime = 100
}: {
  search: State<{
    local: string
    query: string
  }>
  size?: InputProps['height']
  inputProps?: Partial<InputProps>
  debounceTime?: number
}) {
  const { t } = useTranslation()
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  return (
    <Input
      placeholder={t('common:components.search')}
      value={search?.value.local ?? ''}
      onChange={(event) => {
        search.local.set(event.target.value)

        if (debouncedSearchQueryRef) {
          clearTimeout(debouncedSearchQueryRef.current)
        }

        debouncedSearchQueryRef.current = setTimeout(() => {
          search.query.set(event.target.value)
        }, debounceTime)
      }}
      startComponent={<SearchSmSm className="h-20 text-text-secondary" />}
      endComponent={
        <button
          className="h-4 w-4"
          onClick={() => {
            search.local.set('')
            search.query.set('')
          }}
        >
          <XCircleLg className="h-full w-full" />
        </button>
      }
      data-testid="search-input"
      height={size}
      {...inputProps}
    />
  )
}
