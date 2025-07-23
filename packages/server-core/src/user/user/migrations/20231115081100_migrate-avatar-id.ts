import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { userAvatarPath, UserAvatarType } from '@ir-engine/common/src/schemas/user/user-avatar.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const avatarIdColumnExists = await knex.schema.hasColumn(userPath, 'avatarId')

  if (avatarIdColumnExists === true) {
    const users = await knex.select().from(userPath)

    if (users.length > 0) {
      const userAvatars = await Promise.all(
        users
          .filter((item) => item.avatarId)
          .map(
            async (user) =>
              ({
                id: uuidv4(),
                userId: user.id,
                avatarId: user.avatarId,
                createdAt: await getDateTimeSql(),
                updatedAt: await getDateTimeSql()
              }) as UserAvatarType
          )
      )

      await knex.from(userAvatarPath).insert(userAvatars)
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
