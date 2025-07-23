import { useFind } from '@ir-engine/common'
import { userLoginPath } from '@ir-engine/common/src/schema.type.module'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { Tooltip } from '@ir-engine/ui'
import React from 'react'
import { LuInfo } from 'react-icons/lu'

export const UserLastLoginInfo = ({ userId }) => {
  const login = useFind(userLoginPath, {
    query: {
      userId: userId,
      $sort: { createdAt: -1 },
      $limit: 1
    }
  })

  return login.data.length > 0 ? (
    <div className="flex">
      {toDisplayDateTime(login.data[0].createdAt)}
      <Tooltip
        content={
          <>
            <span>IP Address: {login.data[0].ipAddress}</span>
            <br />
            <span>User Agent: {login.data[0].userAgent}</span>
          </>
        }
      >
        <LuInfo className="ml-2 h-5 w-5 bg-transparent" />
      </Tooltip>
    </div>
  ) : (
    <></>
  )
}
