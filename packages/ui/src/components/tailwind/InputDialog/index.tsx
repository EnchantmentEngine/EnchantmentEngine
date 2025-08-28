import React from 'react'

import { EmbedCodeField } from '@ir-engine/client-core/src/common/components/EmbedCodeField'
import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useHookstate } from '@ir-engine/hyperflux'

import { t } from 'i18next'
import Input from '../../../primitives/tailwind/Input'
import Label from '../../../primitives/tailwind/Label'
import Modal, { ModalProps } from '../../../primitives/tailwind/Modal'
import RadioGroup, { OptionType } from '../../../primitives/tailwind/Radio'

interface InputDialogProps {
  title?: string
  fields: FieldOptions[]
  onSubmit: (fieldValues: Record<string, string>) => Promise<void> | void
  onClose?: () => void
  modalProps?: Partial<ModalProps>
}

interface FieldOptions {
  id: string
  label: string
  type?: 'radio' | 'text' | 'codefield'
  defaultValue?: string
  options?: OptionType[]
  placeholder?: string
  validate?: (input: string) => void
  url?: string
  readOnly?: boolean
  containerClassName?: string
  className?: string
  labelClassname?: string
  showLabel?: boolean
}

export const InputDialog = ({ title, fields, onSubmit, onClose, modalProps }: InputDialogProps) => {
  const errorText = useHookstate('')
  const modalProcessing = useHookstate(false)

  // Check if all fields are of type 'codefield'
  const allFieldsAreCodefields = fields.every((field) => field.type === 'codefield')

  const defaultValues = {}
  fields.forEach((field) => {
    defaultValues[field.id] = field.defaultValue || ''
  })

  const fieldValues = useHookstate(defaultValues)

  const handleSubmit = async () => {
    modalProcessing.set(true)
    try {
      await onSubmit(fieldValues.value)
      ModalState.closeModal()
    } catch (error) {
      errorText.set(error.message)
    }
    modalProcessing.set(false)
  }

  const handleChange = (value: string, name: string, index: number) => {
    fields[index]?.validate?.(value)
    fieldValues[name].set(value)
  }

  // For codefields, we want to hide the cancel button by default
  const defaultModalProps = allFieldsAreCodefields
    ? {
        showCloseButton: false,
        submitButtonText: t('common:components.close')
      }
    : {}

  return (
    <Modal
      title={title || t('admin:components.common.confirmation')}
      onSubmit={handleSubmit}
      onClose={() => {
        ModalState.closeModal()
        onClose?.()
      }}
      className="w-[50vw] max-w-2xl"
      submitLoading={modalProcessing.value}
      {...defaultModalProps}
      {...modalProps}
    >
      <div className="flex gap-4">
        {fields.map((field, index) => {
          if (field.type === 'radio') {
            return (
              <div>
                {field.label && <Label className="mb-4">{field.label}</Label>}
                <RadioGroup
                  options={field.options || []}
                  value={fieldValues[field.id].value || ''}
                  onChange={(value) => handleChange(value, field.id, index)}
                />
              </div>
            )
          } else if (field.type === 'codefield') {
            return (
              <EmbedCodeField
                key={field.id}
                url={field.url || ''}
                containerClassName={field.containerClassName}
                className={field.className}
                labelClassname={field.labelClassname}
                showLabel={field.showLabel}
              />
            )
          } else {
            return (
              <Input
                key={field.id}
                value={fieldValues[field.id].value || ''}
                onChange={(e) => handleChange(e.target.value, field.id, index)}
                labelProps={{
                  text: field.label,
                  position: 'top'
                }}
                fullWidth
                placeholder={field.placeholder}
              />
            )
          }
        })}
      </div>
    </Modal>
  )
}

export default InputDialog
