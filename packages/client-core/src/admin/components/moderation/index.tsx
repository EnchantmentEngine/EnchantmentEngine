import { useHookstate } from '@ir-engine/hyperflux'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import Tabs from '@ir-engine/ui/src/primitives/tailwind/Tabs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ModerationBanContainer } from './ModerationBanContainer'
import ModerationTable from './ModerationTable'

export default function Moderation() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })

  return (
    <>
      <Tabs
        tabsData={[
          {
            title: t('admin:components.moderation.header'),
            tabLabel: t('admin:components.moderation.header'),
            bottomComponent: (
              <div className="flex flex-col gap-5">
                <ModerationTable search={search.local.value} />
              </div>
            ),
            topComponent: <SearchBar search={search} debounceTime={1000} />
          },
          {
            title: t('admin:components.moderation.bannedUsers'),
            tabLabel: t('admin:components.moderation.bannedUsers'),
            bottomComponent: (
              <div className="flex flex-col gap-5">
                <ModerationBanContainer search={search.local.value} />
              </div>
            ),
            topComponent: <SearchBar search={search} debounceTime={1000} />
          }
        ]}
        onTabChange={() => search.set({ local: '', query: '' })}
      />
    </>
  )
}
