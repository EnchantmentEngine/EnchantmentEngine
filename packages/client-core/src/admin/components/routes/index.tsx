import React from 'react'
import { useTranslation } from 'react-i18next'

import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import RoutesTable from './RouteTable'

export default function Routes() {
  const { t } = useTranslation()

  return (
    <>
      <Text fontSize="xl" className="mb-6">
        {t('admin:components.route.routes')}
      </Text>

      <RoutesTable />
    </>
  )
}
