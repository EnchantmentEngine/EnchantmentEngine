import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { UserLastLoginInfo } from './UserLastLoginInfo'

export const UserInfo = ({ userId, userEmail, country, usersQuery }) => {
  const user = usersQuery.data.find((user) => user.id == userId)
  return (
    <Text>
      {userId} <br />
      {user?.name} <br />
      {userEmail} <br />
      {country}
      <UserLastLoginInfo userId={userId} />
    </Text>
  )
}
