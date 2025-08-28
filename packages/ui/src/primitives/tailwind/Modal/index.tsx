import React, { ReactNode, useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { MdClose } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import Button from '../Button'
import LoadingView from '../LoadingView'

export interface ModalProps {
  id?: string
  title?: string
  hideFooter?: boolean
  className?: string
  headerIconSrc?: string
  rawChildren?: ReactNode
  children?: ReactNode
  submitLoading?: boolean
  showCloseButton?: boolean
  closeButtonDisabled?: boolean
  submitButtonDisabled?: boolean
  closeButtonText?: string
  submitButtonText?: string
  onClose?: (isHeader: boolean) => void
  onSubmit?: () => void
  cancelKey?: string
  submitKey?: string
}

export const ModalHeader = ({
  title,
  onClose,
  headerIconSrc
}: {
  closeIcon?: boolean
  title?: string
  onClose?: (isHeader: boolean) => void
  headerIconSrc?: string
}) => {
  return (
    <div
      className={twMerge(
        'relative flex justify-center border-b-[0.5px] border-b-surface-outline-3-1 px-6 py-5',
        headerIconSrc ? 'h-32 items-end' : 'items-center'
      )}
    >
      {headerIconSrc && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 transform">
          <img src={headerIconSrc} alt="Infinite Reality Engine Logo" className="h-32 w-32" />
        </div>
      )}

      {title && (
        <h1 className="text-text-primary" data-testid="modal-title-text">
          {title}
        </h1>
      )}
      <button
        className="absolute right-0 top-0 p-[inherit] text-text-primary"
        data-testid="modal-close-button"
        onClick={() => onClose && onClose(true)}
      >
        <MdClose />
      </button>
    </div>
  )
}

export const ModalFooter = ({
  id,
  onCancel,
  onSubmit,
  submitLoading,
  closeButtonDisabled,
  submitButtonDisabled,
  closeButtonText,
  submitButtonText,
  showCloseButton = true
}: {
  id?: string
  onCancel?: (isHeader: boolean) => void
  onSubmit?: () => void
  submitLoading?: boolean
  closeButtonDisabled?: boolean
  submitButtonDisabled?: boolean
  closeButtonText?: string
  submitButtonText?: string
  showCloseButton?: boolean
}) => {
  const { t } = useTranslation()
  return (
    <div className="grid grid-flow-col border-t-[0.5px] border-t-surface-outline-3-1 px-6 py-5">
      {showCloseButton && (
        <Button
          data-testid="modal-cancel-button"
          variant="secondary"
          disabled={closeButtonDisabled}
          onClick={() => onCancel && onCancel(false)}
        >
          {closeButtonText || t('common:components.cancel')}
        </Button>
      )}
      {onSubmit && (
        <Button
          data-testid="modal-submit-button"
          disabled={submitButtonDisabled || submitLoading}
          onClick={onSubmit}
          className="place-self-end"
        >
          {submitButtonText || t('common:components.confirm')}
          {submitLoading ? <LoadingView spinnerOnly className="h-6 w-6" /> : undefined}
        </Button>
      )}
    </div>
  )
}

const Modal = ({
  id,
  title,
  onClose,
  onSubmit,
  hideFooter,
  rawChildren,
  children,
  className,
  submitLoading,
  closeButtonText,
  submitButtonText,
  closeButtonDisabled,
  submitButtonDisabled,
  headerIconSrc,
  showCloseButton = true,
  cancelKey = 'Escape',
  submitKey = 'Enter'
}: ModalProps) => {
  const twClassName = twMerge(
    'absolute z-50 w-full rounded-xl border border-surface-1 bg-white dark:bg-surface-1',
    className
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === cancelKey) onClose?.(false)
      if (event.key === submitKey && !submitButtonDisabled && !submitLoading) onSubmit?.()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onSubmit, submitButtonDisabled, submitLoading])

  return (
    <div data-test-id={id} className={twClassName} data-testid="modal">
      {onClose && <ModalHeader title={title} onClose={onClose} headerIconSrc={headerIconSrc} />}
      {rawChildren}
      {children && <div className="h-fit max-h-[60dvh] w-full overflow-y-auto px-10 py-6">{children}</div>}

      {!hideFooter && (
        <ModalFooter
          id={id}
          closeButtonText={closeButtonText}
          submitButtonText={submitButtonText}
          closeButtonDisabled={closeButtonDisabled}
          submitButtonDisabled={submitButtonDisabled}
          onCancel={onClose}
          onSubmit={onSubmit}
          submitLoading={submitLoading}
          showCloseButton={showCloseButton}
        />
      )}
    </div>
  )
}

export default Modal
