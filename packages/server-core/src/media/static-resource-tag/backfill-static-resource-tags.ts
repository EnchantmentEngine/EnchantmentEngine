import { staticResourceTagPath } from '@ir-engine/common/src/schemas/media/static-resource-tag.schema'
import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { Application } from '../../../declarations'

export const backfillStaticResourceTags = async (app: Application) => {
  const knex = app.get('knexClient')
  const table = staticResourceTagPath

  // Clear existing counts
  await knex(table).del()

  // Stream through static resources to aggregate tags by (project, tag)
  const pageSize = 500
  let skip = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const batch = await app.service(staticResourcePath).find({
      query: { $limit: pageSize, $skip: skip, $select: ['project', 'tags'] },
      paginate: false
    })
    if (!batch.length) break
    const counts = new Map<string, number>()
    for (const r of batch) {
      const project = r.project
      if (!project) continue
      const tags = (r.tags || []) as string[]
      const norm = [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))]
      for (const t of norm) {
        const key = `${project}|||${t}`
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    }
    const rows = Array.from(counts.entries()).map(([key, count]) => {
      const [project, tag] = key.split('|||')
      return { project, tag, count, createdAt: knex.fn.now(), updatedAt: knex.fn.now() }
    })
    if (rows.length) await knex.batchInsert(table, rows, 100)
    skip += pageSize
  }
}
