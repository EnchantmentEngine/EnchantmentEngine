import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IoMdClose } from 'react-icons/io'

import { useClickOutside } from '@ir-engine/common/src/utils/useClickOutside'
import { State, useHookstate } from '@ir-engine/hyperflux'

import Button from '../Button'
import Input from '../Input'
import Label from '../Label'

export interface LabelProps extends React.HtmlHTMLAttributes<HTMLLabelElement> {
  emailList: State<string[]>
  error?: string
  label?: string
  disabled?: boolean
}

const isInList = (email: string, emailList: string[]) => {
  return emailList.includes(email)
}

const isEmail = (email: string) => {
  return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email)
}

const MultiEmailInput = ({ emailList, error, label, disabled }: LabelProps) => {
  const { t } = useTranslation()
  const ref = useRef<HTMLInputElement>(null)

  const state = useHookstate({
    currentEmail: '',
    errorLabel: ''
  } as {
    currentEmail: string
    errorLabel: string
  })

  const addToEmailList = () => {
    const value = state.currentEmail.value.trim()

    if (value && isValid(value)) {
      emailList.merge([state.currentEmail.value])
      state.currentEmail.set('')
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', 'Tab', ','].includes(event.key)) {
      event.preventDefault()
      addToEmailList()
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    state.merge({
      currentEmail: event.target.value,
      errorLabel: ''
    })
  }

  const handleDelete = (email: string) => {
    emailList.set(emailList.value.filter((item) => item !== email))
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()

    const paste = event.clipboardData.getData('text')
    const emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g)

    if (emails) {
      const toBeAdded = emails.filter((email) => !isInList(email, emailList.value as string[]))
      emailList.merge(toBeAdded)
    }
  }

  const isValid = (email: string) => {
    state.errorLabel.set('')
    let error = ''

    if (isInList(email, emailList.value as string[])) {
      error = t('common:multiEmailInput.alreadyAdded', { email })
    }

    if (!isEmail(email)) {
      error = t('common:multiEmailInput.invalidEmail', { email })
    }

    if (error) {
      state.errorLabel.set(error)

      return false
    }

    return true
  }

  useClickOutside(ref, addToEmailList)

  let errorLabel = state.errorLabel.value || error

  return (
    <>
      {label && <Label className="self-stretch">{label}</Label>}

      {emailList.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-lg border	  px-3.5 py-1.5">
          {emailList.value.map((item) => (
            <div className="flex w-fit items-center justify-between gap-1 rounded  px-2 py-1 text-black " key={item}>
              {item}
              <Button
                disabled={disabled}
                className="button  p-1 text-[#6B7280] disabled:opacity-50 dark:text-[#A3A3A3] [&>*]:m-0"
                onClick={() => handleDelete(item)}
              >
                <IoMdClose />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Input
        fullWidth
        value={state.currentEmail.value}
        placeholder={t('common:multiEmailInput.placeholder')}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onPaste={handlePaste}
        disabled={disabled}
        ref={ref}
      />

      {errorLabel && <p className="error ">{errorLabel}</p>}
    </>
  )
}

export default MultiEmailInput
