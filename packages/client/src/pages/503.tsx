import useEngineSetting from '@ir-engine/common/src/hooks/useEngineSetting'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const Custom503 = (): any => {
  console.log('503')
  const { t } = useTranslation()

  const clientSetting = useEngineSetting('client', 'appTitle')

  return (
    <>
      <h1 style={{ color: 'black' }}>{t('503.msg')}</h1>
      {clientSetting && clientSetting.data && (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src={clientSetting?.data[0]?.value}
          alt=""
        />
      )}
    </>
  )
}

export default Custom503
