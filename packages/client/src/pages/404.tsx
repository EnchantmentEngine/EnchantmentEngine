import React, { Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export const Custom404 = (): any => {
  console.log('404')
  const navigate = useNavigate()
  const { t } = useTranslation()
  useEffect(() => {
    navigate('/')
  })
  return (
    <Fragment>
      <h1 style={{ fontSize: '100%', fontWeight: 'normal' }}>{t('404.msg')}</h1>
    </Fragment>
  )
}

export default Custom404
