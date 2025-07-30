import { Country } from 'country-state-city'
import React, { useEffect, useState } from 'react'
import PhoneInput, { CountryDetails } from './index'

export default {
  title: 'Components/Tailwind/PhoneInput',
  component: PhoneInput
}

const Renderer = (args: any) => {
  const [countryDetails, setCountryDetails] = useState<CountryDetails[]>([])

  const [value, setValue] = useState({
    countryIndex: -1,
    phoneNumber: ''
  })

  useEffect(() => {
    const countries = Country.getAllCountries()
    const _countryDetails = countries.map((country) => ({
      flag: country.flag,
      name: country.name,
      dialCode: country.phonecode,
      countryCode: country.isoCode
    }))
    _countryDetails.sort((a, b) => a.name.localeCompare(b.name))
    setCountryDetails(_countryDetails)
  }, [])

  return (
    <PhoneInput
      countries={countryDetails}
      phoneNumber={value.phoneNumber}
      countryIndex={value.countryIndex}
      onCountryIndexChange={(index) => {
        setValue((v) => ({ ...v, countryIndex: index }))
      }}
      onPhoneNumberChange={(phoneNumber) => {
        setValue((v) => ({ ...v, phoneNumber }))
      }}
    />
  )
}

export const Default = Renderer.bind({})
