import { useEngineSetting } from '@ir-engine/common/src/hooks/useEngineSetting'
import { useHookstate } from '@ir-engine/hyperflux'
import { ClientEngineSettingType } from '@ir-engine/server-core/src/appconfig'
import { useEffect } from 'react'

export const useDocumentTitle = (prefix: string) => {
  const clientSetting = useEngineSetting<ClientEngineSettingType>('client')
  const clientTitle = useHookstate(clientSetting?.data?.title || '')

  useEffect(() => {
    if (clientSetting?.status === 'success') {
      document.title = `${prefix} - ${clientSetting.data?.title}`
    }
    return () => {
      document.title = clientTitle.value
    }
  }, [clientSetting.status])
}
