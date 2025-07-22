import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { locationPath, LocationType, scopePath, ScopeType } from '@ir-engine/common/src/schema.type.module'
import { isValidId } from '@ir-engine/common/src/utils/isValidId'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import React from 'react'
import { useTranslation } from 'react-i18next'

import config from '@ir-engine/common/src/config'
import { Engine } from '@ir-engine/ecs'
import { Edit01Lg, Trash04Lg } from '@ir-engine/ui/src/icons'
import { locationColumns, LocationRowType } from '../../common/constants/location'
import DataTable from '../../common/Table'
import ActionButton from '../ActionButton'
import AddEditLocationModal from './AddEditLocationModal'

const getStudioURLfromScene = (url: string) => {
  const key = url.replace(config.client.fileServer, '')
  const [, orgName, projectName] = key.split('/')
  return `/studio?projectName=${orgName}/${projectName}&scenePath=${key}`
}

const transformLink = (link: string) => link.toLowerCase().replace(' ', '-')

export default function LocationTable({ search }: { search: string }) {
  const { t } = useTranslation()

  const scopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.userID,
      type: 'location:write' as ScopeType
    }
  })

  const userHasAccess = scopeQuery.data.length > 0

  const adminLocationQuery = useFind(locationPath, {
    query: {
      action: 'admin',
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })

  useSearch(
    adminLocationQuery,
    {
      $or: [
        {
          id: isValidId(search) ? search : undefined
        },
        {
          name: {
            $like: `%${search}%`
          }
        },
        {
          sceneId: isValidId(search) ? search : undefined
        }
      ]
    },
    search
  )

  const adminLocationRemove = useMutation(locationPath).remove

  const createRows = (rows: readonly LocationType[]): LocationRowType[] =>
    rows.map((row) => ({
      name: (
        <a target="_blank" rel="noopener noreferrer" href={`/location/${transformLink(row.name)}`}>
          {row.name}
        </a>
      ),
      sceneId: (
        <a target="_blank" rel="noopener noreferrer" href={getStudioURLfromScene(row.sceneURL)}>
          {row.sceneId}
        </a>
      ),
      maxUsersPerInstance: row.maxUsersPerInstance.toString(),
      scene: row.slugifiedName,
      locationType: row.locationSetting.locationType,
      videoEnabled: row.locationSetting.videoEnabled
        ? t('admin:components.common.yes')
        : t('admin:components.common.no'),
      action: (
        <div className="flex items-center justify-start gap-3">
          <ActionButton
            icon={Edit01Lg}
            title={t('admin:components.common.view')}
            onClick={() => ModalState.openModal(<AddEditLocationModal action="admin" location={row} />)}
            variant="green"
          />

          <ActionButton
            icon={Trash04Lg}
            title={t('admin:components.common.delete')}
            onClick={() =>
              ModalState.openModal(
                <ConfirmDialog
                  text={`${t('admin:components.location.confirmLocationDelete')} '${row.name}'?`}
                  onSubmit={async () => {
                    await adminLocationRemove(row.id)
                  }}
                />
              )
            }
            variant="red"
          />
        </div>
      )
    }))

  return (
    <DataTable
      size="xl"
      query={adminLocationQuery}
      columns={locationColumns}
      rows={createRows(adminLocationQuery.data)}
    />
  )
}
