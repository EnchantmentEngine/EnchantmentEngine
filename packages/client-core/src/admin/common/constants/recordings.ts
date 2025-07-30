import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'id' | 'user' | 'ended' | 'schema' | 'view' | 'action'

export type RecordingRowType = Record<IdType, string | JSX.Element | undefined>

interface IRecordingColumn extends ITableHeadCell {
  id: IdType
}

export const recordingColumns: IRecordingColumn[] = [
  { id: 'id', sortable: true, label: t('admin:components.recording.columns.id') },
  { id: 'user', label: t('admin:components.recording.columns.user') },
  { id: 'ended', label: t('admin:components.recording.columns.ended') },
  { id: 'schema', label: t('admin:components.recording.columns.schema'), className: 'w-1/3 text-wrap' },
  { id: 'action', label: t('admin:components.recording.columns.action') }
]
