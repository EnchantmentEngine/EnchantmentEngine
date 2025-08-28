import { VALID_SCENE_NAME_REGEX, WINDOWS_RESERVED_NAME_REGEX } from '@ir-engine/common/src/regex'

export default function isValidSceneName(sceneName: string) {
  return !WINDOWS_RESERVED_NAME_REGEX.test(sceneName) && VALID_SCENE_NAME_REGEX.test(sceneName)
}
