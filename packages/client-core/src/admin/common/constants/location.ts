import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'sceneId' | 'maxUsersPerInstance' | 'scene' | 'name' | 'locationType' | 'videoEnabled' | 'action'

export type LocationRowType = Record<IdType, string | JSX.Element | undefined>

interface ILocationColumn extends ITableHeadCell {
  id: IdType
}

export const locationColumns: ILocationColumn[] = [
  { id: 'name', label: t('admin:components.location.columns.name') },
  { id: 'sceneId', label: t('admin:components.location.columns.sceneId') },
  { id: 'maxUsersPerInstance', label: t('admin:components.location.columns.maxUsersPerInstance') },
  { id: 'locationType', label: t('admin:components.location.columns.locationType') },
  { id: 'videoEnabled', label: t('admin:components.location.columns.videoEnabled') },
  { id: 'action', label: t('admin:components.location.columns.action') }
]
