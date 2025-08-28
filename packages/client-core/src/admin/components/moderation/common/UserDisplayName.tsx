import { useFind } from '@ir-engine/common'
import { userPath } from '@ir-engine/common/src/schema.type.module'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'

export const UserDisplayName = ({ userId }) => {
  const {
    data: userData,
    status,
    error
  } = useFind(userPath, {
    query: {
      id: userId,
      $limit: 1
    }
  })

  if (status === 'pending') {
    return <span>Loading...</span>
  }

  if (error) {
    return <span>Error loading user</span>
  }

  const username = userData?.[0]?.name || 'N/A'

  return <Text>{username}</Text>
}
