import React, { ReactNode, forwardRef, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { ChevronDownLg } from '../../../icons'

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  children?: ReactNode
  open?: boolean
}

const Accordion = forwardRef(
  (
    { title, subtitle, children, className, open, ...props }: AccordionProps,
    ref: React.MutableRefObject<HTMLDivElement>
  ): JSX.Element => {
    const [openState, setOpenState] = useState(false)
    const [maxHeight, setMaxHeight] = useState('0px')
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      setOpenState(!!open)
    }, [open])

    useEffect(() => {
      if (contentRef.current) {
        const content = contentRef.current
        if (openState) {
          const height = content.scrollHeight
          setMaxHeight(`${height}px`)
        } else {
          setMaxHeight('0px')
        }
      }
    }, [openState, children])

    return (
      <div className="w-full" {...props} ref={ref}>
        <div
          className={twMerge(
            'flex w-full cursor-pointer flex-col items-center justify-between gap-y-2 border-[0.5px] border-ui-outline bg-white p-2 dark:bg-surface-3',
            openState ? 'rounded-t-md' : ''
          )}
          data-testid="accordion-header"
          onClick={() => {
            setOpenState((v) => !v)
          }}
        >
          <div className="flex w-full items-center justify-between p-4">
            <h2 className="flex-1 truncate text-base font-semibold leading-4 text-text-primary">{title}</h2>
            <ChevronDownLg
              className={twMerge('h-5 w-5 text-text-primary duration-300', openState ? 'rotate-180' : '')}
              data-testid={openState ? 'close-accordion-icon' : 'open-accordion-icon'}
            />
          </div>

          {subtitle && <p className="w-full text-base text-text-secondary">{subtitle}</p>}
        </div>

        <div
          className={twMerge(
            'w-full origin-top overflow-hidden border-[0.5px] border-ui-outline bg-white transition-[max-height] duration-300 ease-in-out dark:bg-surface-1',
            openState ? 'rounded-b-md border-t-0' : 'border-none'
          )}
          style={{
            maxHeight
          }}
          ref={contentRef}
        >
          <div className="p-2">{children}</div>
        </div>
      </div>
    )
  }
)

export default Accordion
