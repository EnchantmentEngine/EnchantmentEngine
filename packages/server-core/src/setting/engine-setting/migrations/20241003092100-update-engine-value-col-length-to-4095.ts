import { engineSettingPath } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(engineSettingPath, (table) => {
    table.string('value', 4095).alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(engineSettingPath, (table) => {
    table.string('value', 225).alter()
  })
}
