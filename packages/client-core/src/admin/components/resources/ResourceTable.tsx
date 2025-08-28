import React from 'react'
import { useTranslation } from 'react-i18next'

import { useFind, useSearch } from '@ir-engine/common'
import { StaticResourceType, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'

import { API } from '@ir-engine/common'
import { Edit01Lg, Trash04Lg } from '@ir-engine/ui/src/icons'
import { ModalState } from '../../../common/services/ModalState'
import DataTable from '../../common/Table'
import { resourceColumns } from '../../common/constants/resources'
import ActionButton from '../ActionButton'
import AddEditResourceModal from './AddEditResourceModal'

const RESOURCE_PAGE_LIMIT = 25

export default function ResourceTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const resourceQuery = useFind(staticResourcePath, {
    query: {
      action: 'admin',
      $limit: RESOURCE_PAGE_LIMIT,
      $sort: {
        key: 1
      }
    }
  })

  useSearch(
    resourceQuery,
    {
      key: {
        $like: `%${search}%`
      }
    },
    search
  )

  const createData = (el: StaticResourceType) => {
    return {
      id: el.id,
      key: el.key,
      mimeType: el.mimeType,
      project: el.project,
      action: (
        <div className="flex items-center justify-start gap-3">
          <ActionButton
            icon={Edit01Lg}
            onClick={() => {
              ModalState.openModal(<AddEditResourceModal selectedResource={el} />)
            }}
            variant="green"
          />

          <ActionButton
            icon={Trash04Lg}
            title={t('admin:components.common.delete')}
            onClick={() => {
              ModalState.openModal(
                <ConfirmDialog
                  text={`${t('admin:components.resources.confirmResourceDelete')} '${el.key}'?`}
                  onSubmit={async () => {
                    await API.instance.service(staticResourcePath).remove(el.id)
                  }}
                />
              )
            }}
            variant="red"
          />
        </div>
      )
    }
  }

  const createRows = () =>
    resourceQuery.data?.map((el: StaticResourceType) => {
      return createData(el)
    })

  return <DataTable size="xl" query={resourceQuery} columns={resourceColumns} rows={createRows()} />
}
