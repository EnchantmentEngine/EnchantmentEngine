/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { calculateAndApplyYOffset } from '@ir-engine/common/src/utils/offsets'

import { Country, ICountry } from 'country-state-city'
import Input from '../Input'
import { GeocodedLocation, ReverseGeocodingService } from './ReverseGeocodingService'

export type OptionValueType = string | number

export type SelectOptionsType = {
  label: string
  value: any
  disabled?: boolean
  metadata?: { [key: string]: string }
}

export interface PhoneinputProps<T extends OptionValueType> {
  labelProps?: {
    text: string
    position: 'top' | 'left'
    infoText?: string
  }
  className?: string
  error?: string
  description?: string
  currentValue?: T
  onChange: (value: { phonecode: string; country: string; flag: string; isoCode: string; value: string }) => void
  placeholder?: string
  disabled?: boolean
  menuClassname?: string
  menuItemClassName?: string
  labelClassName?: string
  inputVariant?: 'outlined' | 'underlined' | 'onboarding'
  inputClassName?: string
  errorBorder?: boolean
  searchDisabled?: boolean
  inputContainerClassName?: string
  endComponent?: JSX.Element
  customMenuContent?: (SelectOptionsType) => JSX.Element
}

const PhoneInput = <T extends OptionValueType>({
  labelProps,
  className,
  onChange,
  disabled,
  menuClassname
}: PhoneinputProps<T>) => {
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const [geocodedLocation, setGeocodedLocation] = useState<GeocodedLocation | undefined>(undefined)
  const [userCountry, setUserCountry] = useState<ICountry | undefined>(undefined)
  const [value, setValue] = useState<string>('')
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  useEffect(() => {
    ReverseGeocodingService().then((r) => setGeocodedLocation(r.data))
  }, [])

  useEffect(() => {
    if (!userCountry && geocodedLocation) {
      setCountry(null, geocodedLocation?.country, '')
    }
  }, [userCountry, geocodedLocation])

  useEffect(() => {
    const handleResize = () => {
      calculateAndApplyYOffset(menuRef.current, -50)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleChange = (value) => {
    const { phonecode, nocodeValue } = parseNumber(value)
    if (value.length) {
      setCountry(phonecode, null, nocodeValue)
    } else {
      setCountry(null, geocodedLocation?.country, nocodeValue)
    }
  }

  const setCountry = (phonecode, isoCode, value?) => {
    let country: ICountry | undefined
    if (isoCode) country = Country.getCountryByCode(isoCode)
    if (phonecode)
      country = Country.getAllCountries().find((country) => {
        if (country.phonecode === '1' && country.isoCode !== 'US') return false
        return normalizePhoneCode(country.phonecode) === normalizePhoneCode(phonecode)
      })
    if (country) {
      setUserCountry(country)
      const newValue = `${normalizePhoneCode(country?.phonecode)} ${value ? value : ''}`
      setValue(newValue)
      onChange({
        value: newValue,
        country: country.name,
        flag: country.flag,
        isoCode: country.isoCode,
        phonecode: country.phonecode
      })
    } else {
      console.log('IR> no country found')
    }
  }

  const parseNumber = (value) => {
    const segments = value.split(' ')
    const phonecode = segments.shift().replace('+', '')
    const nocodeValue = segments.length > 0 ? segments.join(' ') : segments

    return {
      segments,
      phonecode,
      nocodeValue
    }
  }

  const normalizePhoneCode = (phonecode) => {
    return phonecode.includes('+') ? phonecode : `+${phonecode}`
  }

  return (
    <div className={twMerge('relative w-full', className)} ref={ref} data-testid="phone-input-container">
      <Input
        data-testid="phone-input"
        labelProps={labelProps}
        disabled={disabled}
        defaultValue={value}
        value={value}
        startComponent={
          <div
            onClick={() => {
              setIsMenuOpen(!isMenuOpen)
            }}
          >
            {userCountry?.flag}
          </div>
        }
        type="tel"
        onChange={(e) => {
          handleChange(e.target.value)
        }}
      />
      <div
        className={`absolute z-30 mt-2 w-full rounded border border-theme-primary bg-theme-surface-main ${
          isMenuOpen ? 'visible' : 'hidden'
        }`}
        ref={menuRef}
      >
        <ul
          className={twMerge('max-h-40 overflow-auto [&>li]:px-4 [&>li]:py-2', menuClassname)}
          data-testid="select-input-list"
        >
          {Country.getAllCountries().map((country, index) => (
            <li
              key={index}
              value={country.name}
              className={twMerge(
                'cursor-pointer px-4 py-2 text-theme-secondary',
                'hover:bg-theme-highlight hover:text-theme-highlight'
              )}
              data-testid="select-input-list-item"
              onClick={() => {
                const { nocodeValue } = parseNumber(value)
                handleChange(`${country.phonecode} ${nocodeValue}`)
                setIsMenuOpen(!isMenuOpen)
              }}
            >
              <div className="grid grid-cols-5 gap-4">
                <div className="">{country.flag}</div>
                <div className="col-span-3">{country.name}</div>
                <div className="">{normalizePhoneCode(country.phonecode)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default PhoneInput
