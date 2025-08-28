import { useFind } from '@ir-engine/common'
import { moderationBanPath } from '@ir-engine/common/src/schema.type.module'
import { getState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthState } from '../user/services/AuthService'

export const useUserBannedCheck = () => {
  const navigate = useNavigate()
  const selfUser = getState(AuthState).user
  const { data } = useFind(moderationBanPath, {
    query: {
      banUserId: selfUser?.id,
      banned: true
    }
  })

  useEffect(() => {
    if (data?.length > 0) {
      navigate('/banned')
      return
    }
  }, [data])
}
