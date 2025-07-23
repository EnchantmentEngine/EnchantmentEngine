import { scopeTypePath } from '@ir-engine/common/src/schemas/scope/scope-type.schema'
import { scopePath, ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../declarations'

export default async (app: Application, userId: UserID) => {
  const adminCount = await app.service(scopePath).find({
    query: {
      $select: ['id'],
      type: 'admin:admin' as ScopeType
    },
    paginate: false
  })

  if (adminCount.length === 0) {
    const scopeTypes = await app.service(scopeTypePath).find({
      paginate: false
    })

    const data = scopeTypes.map(({ type }) => {
      return { userId, type }
    })
    await app.service(scopePath).create(data)
  }
}
