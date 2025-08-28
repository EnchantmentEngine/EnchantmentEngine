import React from 'react'

import { useFind, useMutation } from '@ir-engine/common'
import { InstalledRoutesInterface } from '@ir-engine/common/src/interfaces/Route'
import { routePath } from '@ir-engine/common/src/schema.type.module'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'

import { routeColumns, RouteRowType } from '../../common/constants/route'
import DataTable from '../../common/Table'

export default function RoutesTable() {
  const installedRouteData = useFind('routes-installed').data
  const routesQuery = useFind(routePath, {
    query: { $limit: 20 }
  })
  const routeActivateCreate = useMutation('route-activate').create

  const isRouteActive = (project: string, route: string) =>
    routesQuery.data.findIndex((a) => {
      return a.project === project && a.route === route
    }) !== -1

  const activateCallback = (project: string, route: string, checked: boolean) => {
    routeActivateCreate({ project, route, activate: checked }).then(() => routesQuery.refetch())
  }

  const createRows = (rows: readonly InstalledRoutesInterface[]): RouteRowType[] =>
    rows
      .map((row) => {
        if (!row.routes?.length) return []
        return row.routes.map((route) => ({
          id: row.project + route,
          project: row.project,
          route: route,
          action: (
            <Toggle
              value={isRouteActive(row.project, route)}
              onChange={(checked) => activateCallback(row.project, route, checked)}
            />
          )
        }))
      })
      .flat()

  return <DataTable size="xl" query={routesQuery} columns={routeColumns} rows={createRows(installedRouteData)} />
}
