import { useFind } from '@ir-engine/common'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { unflattenArrayToObject } from '@ir-engine/common/src/utils/jsonHelperUtils'
import { useMemo } from 'react'

/**
 * Hook to fetch and parse engine settings for a specific category
 *
 * @param category - The category of engine settings to fetch
 * @param jsonKey - Optional jsonKey to filter settings
 * @returns An object containing the parsed settings and query status
 *
 * @example
 * ```tsx
 * // Get authentication settings
 * const { data: authSettings, status } = useEngineSetting('authentication');
 *
 * // Get client settings
 * const { data: clientSettings, status } = useEngineSetting('client');
 * ```
 */
export function useEngineSetting<T = Record<string, any>>(category: string, key?: string, jsonKey?: string) {
  // Prepare query parameters
  const queryParams: Record<string, any> = {
    category,
    paginate: false
  }

  // Add jsonKey to query if provided
  if (jsonKey) {
    queryParams.jsonKey = jsonKey
  }

  // Fetch engine settings
  const engineSettingQuery = useFind(engineSettingPath, {
    query: queryParams
  })

  // Parse settings using useMemo to avoid unnecessary recalculations
  const parsedSettings = useMemo(() => {
    if (!engineSettingQuery.data || engineSettingQuery.data.length === 0) {
      return null
    }

    return unflattenArrayToObject(
      engineSettingQuery.data.map((setting) => ({
        key: setting.key,
        value: setting.value,
        dataType: setting.dataType
      }))
    ) as T
  }, [engineSettingQuery.data])

  // Return both the parsed settings and the query status
  return {
    data: parsedSettings,
    status: engineSettingQuery.status,
    error: engineSettingQuery.error,
    refetch: engineSettingQuery.refetch
  }
}

export default useEngineSetting
