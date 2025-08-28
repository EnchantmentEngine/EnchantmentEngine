import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  className?: string
  children?: ReactNode
}

const TableHeaderCell = ({ className, children, ...props }: TableCellProps) => {
  const twClassName = twMerge('text-text-primary', 'p-4', 'border border-[0.5px] border-ui-outline ', className)
  return (
    <th className={twClassName} {...props}>
      {children}
    </th>
  )
}

const TableHeadRow = ({
  theadClassName,
  className,
  children
}: {
  theadClassName?: string
  className?: string
  children: JSX.Element | JSX.Element[]
}) => {
  const twClassName = twMerge('text-left capitalize', className)
  const twClassNameThead = twMerge('sticky top-[-2px] z-10 bg-white dark:bg-surface-2', theadClassName)
  return (
    <thead className={twClassNameThead}>
      <tr className={twClassName}>{children}</tr>
    </thead>
  )
}

const TableCell = ({ className, children, ...props }: TableCellProps) => {
  const twClassName = twMerge(
    'p-4',
    'border border-[0.5px] border-ui-outline',
    'text-left text-text-primary',
    className
  )
  return (
    <td className={twClassName} {...props}>
      {children}
    </td>
  )
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string
  children?: ReactNode
}
const TableRow = ({ className, children, ...props }: TableRowProps) => {
  const twClassName = twMerge('bg-surface-3 even:bg-white dark:even:bg-surface-4', className)
  return (
    <tr className={twClassName} {...props}>
      {children}
    </tr>
  )
}

interface TableSectionProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string
  children?: ReactNode
}

const TableBody = ({ className, children, ...props }: TableSectionProps) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  )
}

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string
  className?: string
  children?: ReactNode
}

const Table = ({ containerClassName, className, children }: TableProps) => {
  const twClassname = twMerge(
    'relative w-full table-auto border-collapse overflow-scroll whitespace-nowrap text-sm',
    className
  )
  return (
    <div className={twMerge('overflow-x-auto rounded-md', containerClassName)}>
      <table className={twClassname}>{children}</table>
    </div>
  )
}

type TablePaginationProps = Readonly<{
  className?: string
  totalPages: number
  currentPage: number
  neighbours?: number
  onPageChange: (newPage: number) => void
}>
const TablePagination = ({
  className,
  neighbours = 1,
  totalPages,
  currentPage,
  onPageChange
}: TablePaginationProps) => {
  const { t } = useTranslation()
  const commonClasses = twMerge('pt-4 text-sm font-medium text-text-secondary enabled:hover:text-text-primary')
  const controlsClasses = twMerge(commonClasses, 'px-2 pt-5 enabled:text-text-primary')
  const pageClasses = twMerge(commonClasses, 'px-4')
  const currentPageClasses = twMerge(pageClasses, 'border-t-2 border-ui-primary text-ui-primary')

  if (currentPage + 1 == totalPages) {
    neighbours = Math.max(2, neighbours)
  }

  const prevPages = [] as number[]
  for (let i = currentPage - 1; i >= Math.max(0, currentPage - neighbours); i--) {
    prevPages.push(i)
  }
  prevPages.reverse()

  const nextPages = [] as number[]
  for (let i = currentPage + 1; i < Math.min(totalPages, currentPage + neighbours + 1); i++) {
    nextPages.push(i)
  }

  return (
    <div className="flex-column mb-2 flex flex-wrap items-center justify-center pt-10 md:flex-row">
      <ul className="flex h-[38px] items-center justify-center">
        <li>
          <button
            disabled={currentPage === 0}
            className={twMerge(controlsClasses, 'mr-5')}
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          >
            {t('common:table.pagination.prev')}
          </button>
        </li>

        {prevPages.map((page) => (
          <li key={page}>
            <button onClick={() => onPageChange(page)} className={pageClasses}>
              {page + 1}
            </button>
          </li>
        ))}

        <li>
          <button onClick={() => onPageChange(currentPage)} className={currentPageClasses}>
            {currentPage + 1}
          </button>
        </li>

        {nextPages.map((page) => (
          <li key={page}>
            <button onClick={() => onPageChange(page)} className={pageClasses}>
              {page + 1}
            </button>
          </li>
        ))}

        {totalPages > 0 && nextPages[nextPages.length - 1] < totalPages - 2 && (
          <li>
            <button disabled={true} className={pageClasses}>
              ...
            </button>
          </li>
        )}

        {totalPages > 0 && nextPages[nextPages.length - 1] < totalPages - 1 && (
          <>
            <li key={totalPages}>
              <button onClick={() => onPageChange(totalPages - 1)} className={pageClasses}>
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li>
          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            className={twMerge(controlsClasses, 'ml-5')}
          >
            {t('common:table.pagination.next')}
          </button>
        </li>
      </ul>
    </div>
  )
}

export default Table
export { Table, TableBody, TableCell, TableHeaderCell, TableHeadRow, TablePagination, TableRow }
