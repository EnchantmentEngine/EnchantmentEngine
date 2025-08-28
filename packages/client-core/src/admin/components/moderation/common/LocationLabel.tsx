import { useFind } from '@ir-engine/common'
import { locationPath } from '@ir-engine/common/src/schema.type.module'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'

export const LocationLabel = ({ locationId, showUrl = false }) => {
  const {
    data: locationData,
    status,
    error
  } = useFind(locationPath, {
    query: {
      id: locationId,
      $limit: 1
    }
  })

  if (status === 'pending') {
    return <span>Loading...</span>
  }

  if (error) {
    return <span>Error loading location</span>
  }

  const location = locationData?.find((location) => location.id == locationId)
  const locationName = location?.name || 'N/A'
  const locationUrl = location?.url || 'N/A'

  return (
    <div>
      <Text>{locationName}</Text>
      {showUrl && <div>{locationUrl}</div>}
    </div>
  )
}
