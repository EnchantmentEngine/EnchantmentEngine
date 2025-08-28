import { t } from 'i18next'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useHookstate } from '@ir-engine/hyperflux'
import Tabs from '@ir-engine/ui/src/primitives/tailwind/Tabs'

import AuthenticationTab from './tabs/authentication'
import AwsTab from './tabs/aws'
import ClientTab from './tabs/client'
import EmailTab from './tabs/email'
import FeaturesTab from './tabs/features'
import HelmTab from './tabs/helm'
import InstanceServerTab from './tabs/instanceServer'
import MetabaseTab from './tabs/metabase'
import ProjectTab from './tabs/project'
import RedisTab from './tabs/redis'
import ServerTab from './tabs/server'
import TaskServerTab from './tabs/taskServer'
import ZendeskTab from './tabs/zendesk'

export const SettingsTabsData = [
  {
    label: t('admin:components.setting.project.header'),
    Component: ProjectTab
  },
  {
    label: t('admin:components.setting.server.header'),
    Component: ServerTab
  },
  {
    label: t('admin:components.setting.helm.header'),
    Component: HelmTab
  },
  {
    label: t('admin:components.setting.client.header'),
    Component: ClientTab
  },
  {
    label: t('admin:components.setting.instanceServer.header'),
    Component: InstanceServerTab
  },
  {
    label: t('admin:components.setting.taskServer.taskServer'),
    Component: TaskServerTab
  },
  {
    label: t('admin:components.setting.email.header'),
    Component: EmailTab
  },
  {
    label: t('admin:components.setting.authentication.header'),
    Component: AuthenticationTab
  },
  {
    label: t('admin:components.setting.redis.header'),
    Component: RedisTab
  },
  {
    label: t('admin:components.setting.aws.header'),
    Component: AwsTab
  },
  {
    label: t('admin:components.setting.features.header'),
    Component: FeaturesTab
  },
  {
    id: 'metabase',
    label: t('admin:components.setting.metabase.header'),
    Component: MetabaseTab
  },
  {
    label: t('admin:components.setting.zendesk.header'),
    Component: ZendeskTab
  }
]

const getInitialTabIndex = () => {
  const foundIndex = SettingsTabsData.findIndex((tab) => '#' + encodeURI(tab.label) === window.location.hash)
  return foundIndex === -1 ? 0 : foundIndex
}

export default function Settings() {
  const { t } = useTranslation()

  const openState = useHookstate(SettingsTabsData.map(() => false))

  const refs = useRef<React.RefObject<HTMLDivElement>[]>(SettingsTabsData.map(() => React.createRef()))

  const tabsData = SettingsTabsData.map((tabData, idx) => ({
    id: tabData.id,
    title: t('admin:components.setting.settings'),
    tabLabel: tabData.label,
    bottomComponent: <tabData.Component ref={refs.current[idx]} open={openState[idx].value} />,
    ref: refs.current[idx]
  }))

  const onTabChange = (index: number) => {
    window.location.hash = SettingsTabsData[index].label
    openState.set(openState.value.map((_, i) => i === index))
  }

  return <Tabs scrollable tabsData={tabsData} currentTabIndex={getInitialTabIndex()} onTabChange={onTabChange} />
}
