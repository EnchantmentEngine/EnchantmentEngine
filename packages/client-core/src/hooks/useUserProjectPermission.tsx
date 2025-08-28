import { useFind } from '@ir-engine/common'
import { ProjectPermissionType, projectPermissionPath } from '@ir-engine/common/src/schema.type.module'
import { EngineState } from '@ir-engine/ecs'
import { useMutableState } from '@ir-engine/hyperflux'

/**
 *
 * @param path
 * @param queryParams
 * @param options
 * @returns
 */
export const useProjectPermissions = (project: string): ProjectPermissionType => {
  const userID = useMutableState(EngineState).userID.value
  const { data } = useFind(projectPermissionPath, {
    query: {
      project,
      userId: userID,
      paginate: false
    }
  })
  const [permission] = data
  return permission
}

/**
 *
 * @param {ProjectPermissionType} userPermission current user permission
 * @param {string | string[]} required required permission
 * @returns {boolean} whether the user has or not the required permission
 */
export const userHasProjectPermission = (
  userPermission: ProjectPermissionType,
  required: string[] | string
): boolean => {
  if (!userPermission?.type) {
    return false
  }

  if (!Array.isArray(required)) {
    return userPermission.type === required
  }
  return required.includes(userPermission.type)
}
