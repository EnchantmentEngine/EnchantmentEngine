import { useFind } from '@ir-engine/common'
import { featureFlagSettingPath } from '@ir-engine/common/src/schema.type.module'

const useFeatureFlags = (flagNames: string[]): boolean[] => {
  const response = useFind(featureFlagSettingPath, {
    query: {
      $or: flagNames.map((flagName) => ({ flagName })),
      paginate: false
    }
  })

  if (response.status !== 'success') {
    return []
  }

  return flagNames.map((flagName) => {
    const flag = response.data.find(({ flagName: name }) => name === flagName)
    return flag ? flag.flagValue : true
  })
}

export default useFeatureFlags
