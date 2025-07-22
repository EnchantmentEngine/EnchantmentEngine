import React, { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiArrowSmallDown, HiArrowSmallUp, HiArrowsUpDown } from 'react-icons/hi2'

import { FeathersOrder, useFind } from '@ir-engine/common'
import { ImmutableObject, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Table, {
  TableBody,
  TableCell,
  TableHeadRow,
  TableHeaderCell,
  TablePagination,
  TableRow
} from '@ir-engine/ui/src/primitives/tailwind/Table'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { twMerge } from 'tailwind-merge'

export interface ITableHeadCell {
  id: string | number
  label: string | JSX.Element
  sortable?: boolean
  className?: string
}

interface TableHeadProps {
  onRequestSort: (property: string | number, order: FeathersOrder) => void
  order: ImmutableObject<Record<string, FeathersOrder>>
  columns: ITableHeadCell[]
}

const TableHead = ({ order, onRequestSort, columns }: TableHeadProps) => {
  const SortArrow = ({ columnId }: { columnId: string | number }) => {
    const currentOrder: FeathersOrder = columnId in order && order[columnId] === 1 ? 1 : -1
    const newOrder: FeathersOrder = currentOrder === 1 ? -1 : 1
    const Icon = currentOrder === 1 ? HiArrowSmallDown : HiArrowSmallUp

    if (columnId in order && order[columnId] === 1) {
      return <Icon onClick={() => onRequestSort(columnId, newOrder)} />
    }
    return <HiArrowsUpDown onClick={() => onRequestSort(columnId, newOrder)} />
  }

  return (
    <TableHeadRow>
      {columns.map((column) => (
        <TableHeaderCell key={column.id} className={column.className}>
          {column.sortable ? (
            <span className="flex items-center gap-2">
              {column.label}
              {<SortArrow columnId={column.id} />}
            </span>
          ) : (
            column.label
          )}
        </TableHeaderCell>
      ))}
    </TableHeadRow>
  )
}

type RowType = Record<string | 'className' | 'id', string | ReactNode>

const TABLE_HEIGHT_SIZES = {
  xs: 'h-table-size-xs',
  sm: 'h-table-size-sm',
  md: 'h-table-size-md',
  lg: 'h-table-size-lg',
  xl: 'h-table-size-xl',
  full: 'h-table-size-full'
}

interface DataTableProps {
  className?: string
  query: ReturnType<typeof useFind>
  rows: RowType[]
  columns: ITableHeadCell[]
  size?: keyof typeof TABLE_HEIGHT_SIZES
}

const DataTable = ({ query, columns, rows, className, size }: DataTableProps) => {
  const { t } = useTranslation()

  const storedRows = useHookstate<{ fetched: boolean; rows: RowType[] }>({ fetched: false, rows: [] })

  useEffect(() => {
    if (['success', 'error'].includes(query.status)) {
      storedRows.set({ fetched: true, rows })
    }
  }, [rows, query.status])

  return !storedRows.fetched.value ? (
    <div className="flex animate-pulse flex-col gap-2">
      {Array.from({ length: 20 }, (_, i) => i).map((idx) => (
        <div key={idx} className="h-12 w-full odd:bg-surface-1 even:bg-surface-2" />
      ))}
    </div>
  ) : (
    <div className="relative">
      {query.status === 'pending' && (
        <div className="absolute left-1/2 top-1/2 flex h-8 -translate-x-1/2 -translate-y-1/2 items-center">
          <LoadingView className="mx-1 h-8 w-8" />
          <Text className="mx-1">{t('common:table.refetching')}</Text>
        </div>
      )}
      <Table
        containerClassName={twMerge(
          `${query.status === 'pending' && 'opacity-50'}`,
          `${TABLE_HEIGHT_SIZES[size || 'full']}`,
          className
        )}
      >
        <TableHead
          order={query.sort}
          onRequestSort={(property, order) => query.setSort({ [property]: order })}
          columns={columns}
        />
        <TableBody>
          {storedRows.rows.length === 0 && (
            <TableRow>
              <TableCell {...{ colSpan: columns.length }} className="text-center italic">
                {t('common:table.noData')}
              </TableCell>
            </TableRow>
          )}
          {storedRows.rows.get(NO_PROXY).map((row, rowIdx) => (
            <TableRow key={typeof row['id'] === 'string' ? row['id'] : rowIdx}>
              {columns.map((column, columnIdx) => (
                <TableCell key={columnIdx} className={column.className}>
                  {row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        totalPages={Math.ceil(query.total / query.limit)}
        currentPage={query.page}
        onPageChange={(newPage) => query.setPage(newPage)}
      />
    </div>
  )
}

export default DataTable
