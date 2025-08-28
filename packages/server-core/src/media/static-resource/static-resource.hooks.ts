import { BadRequest, Forbidden, NotFound } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { projectHistoryPath, projectPath } from '@ir-engine/common/src/schema.type.module'
import { staticResourceTagPath } from '@ir-engine/common/src/schemas/media/static-resource-tag.schema'
import { staticResourceVectorPath } from '@ir-engine/common/src/schemas/media/static-resource-vector.schema'
import { StaticResourceType, staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { isValidId } from '@ir-engine/common/src/utils/isValidId'
import { AssetType, FileToAssetType } from '@ir-engine/spatial/src/resources/AssetType'
import { discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'
import { isEmpty } from 'lodash'
import { HookContext } from '../../../declarations'
import logger from '../../ServerLogger'
import { default as appConfig } from '../../appconfig'
import allowNullQuery from '../../hooks/allow-null-query'
import checkScope from '../../hooks/check-scope'
import enableClientPagination from '../../hooks/enable-client-pagination'
import isAction from '../../hooks/is-action'
import resolveProjectId from '../../hooks/resolve-project-id'
import resolveProjectsByPermission from '../../hooks/resolve-projects-by-permission'
import setLoggedinUserInBody from '../../hooks/set-loggedin-user-in-body'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { createStaticResourceHash } from '../upload-asset/upload-asset.service'
import { patchSingleProjectResourcesJson, removeProjectResourcesJson } from './static-resource-helper'
import { StaticResourceService } from './static-resource.class'
import {
  staticResourceDataResolver,
  staticResourcePatchResolver,
  staticResourceResolver
} from './static-resource.resolvers'

const ensureProject = async (context: HookContext<StaticResourceService>) => {
  if (!context.data || !(context.method === 'create' || context.method === 'update')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data = Array.isArray(context.data) ? context.data : [context.data]

  for (const item of data)
    if (item.key?.startsWith('projects/') && !item.project)
      throw new BadRequest('Project is required for project resources')
}

/**
 * Ensure static-resource with the specified id exists and user is creator of the resource
 * @param context
 * @returns
 */
const ensureResource = async (context: HookContext<StaticResourceService>) => {
  const resource = await context.app.service(staticResourcePath).get(context.id!)

  if (!resource.userId) {
    if (context.params?.provider) await verifyScope('admin', 'admin')(context as any)
  } else if (context.params?.provider && resource.userId !== context.params?.user?.id)
    throw new Forbidden('You are not the creator of this resource')

  if (resource.key) {
    const storageProvider = getStorageProvider()
    await storageProvider.deleteResources([resource.key])
  }
}

const createHashIfNeeded = async (context: HookContext<StaticResourceService>) => {
  if (!context.data || !(context.method === 'create' || context.method === 'update')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Batch create is not supported')

  const data = context.data

  if (!data.key) throw new BadRequest('key is required')

  if (!data.hash) {
    const storageProvider = getStorageProvider()
    const [_, directory, file] = /(.*)\/([^\\\/]+$)/.exec(data.key)!
    if (!(await storageProvider.doesExist(file, directory))) throw new BadRequest('File could not be found')
    const result = await storageProvider.getObject(data.key)
    const hash = createStaticResourceHash(result.Body)
    context.data.hash = hash
  }
}

const updateName = async (context: HookContext<StaticResourceService>) => {
  if (!context.data || !(context.method === 'create' || context.method === 'update' || context.method === 'patch')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Batch create is not supported')

  const id = context.id
  const data = context.data

  if (!data.key) {
    return
  }

  if (data.name) {
    return
  }

  let shouldUpdateName = false
  if (context.method === 'create') {
    shouldUpdateName = true
  } else {
    if (!id) {
      return
    }
    const existingResource = await context.app.service(staticResourcePath).get(id, {
      query: {
        $select: ['key', 'name']
      }
    })

    const [existing_, existingDirectory, existingFile] = /(.*)\/([^\\\/]+$)/.exec(existingResource.key)!
    if (!existingResource.name || existingResource.name === existingFile) {
      shouldUpdateName = true
    }
  }

  if (shouldUpdateName) {
    const [_, directory, file] = /(.*)\/([^\\\/]+$)/.exec(data.key)!
    context.data.name = file
  }
}

const updateResourcesJson = async (context: HookContext<StaticResourceService>) => {
  if (!context.method || !(context.method === 'create' || context.method === 'update' || context.method === 'patch'))
    throw new BadRequest('[updateResourcesJson] Only create, update, patch methods are supported')

  if (!context.result) throw new BadRequest('[updateResourcesJson] Result not found')

  const ignoreResourcesJson = context.params?.ignoreResourcesJson
  if (ignoreResourcesJson) return

  const results =
    'data' in context.result ? context.result.data : Array.isArray(context.result) ? context.result : [context.result]

  for (const result of results) {
    await patchSingleProjectResourcesJson(context.app, result.id)
  }
}

const removeResourcesJson = async (context: HookContext<StaticResourceService>) => {
  if (!context.method || context.method !== 'remove')
    throw new BadRequest('[removeResourcesJson] Only remove method is supported')

  if (!context.result) throw new BadRequest('[removeResourcesJson] Result not found')

  const ignoreResourcesJson = context.params?.ignoreResourcesJson
  if (ignoreResourcesJson) return

  const results =
    'data' in context.result ? context.result.data : Array.isArray(context.result) ? context.result : [context.result]

  for (const result of results) {
    await removeProjectResourcesJson(context.app, result)
  }
}

const normalizeTags = (tags?: string[] | null) =>
  (tags || []).map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0)

const delta = (oldTags: string[], newTags: string[]) => {
  const oldSet = new Set(oldTags)
  const newSet = new Set(newTags)
  const added: string[] = []
  const removed: string[] = []
  for (const t of newSet) if (!oldSet.has(t)) added.push(t)
  for (const t of oldSet) if (!newSet.has(t)) removed.push(t)
  return { added, removed }
}

const upsertTagCounts = async (
  context: HookContext<StaticResourceService>,
  project: string | undefined | null,
  toInc: string[],
  toDec: string[]
) => {
  if (!project || (!toInc.length && !toDec.length)) return
  const knex = context.app.get('knexClient')
  const table = staticResourceTagPath

  // increment
  for (const tag of toInc) {
    // Try update first
    const updated = await knex(table)
      .where({ project, tag })
      .update({ count: knex.raw('?? + 1', ['count']), updatedAt: knex.fn.now() })

    if (!updated) {
      try {
        await knex(table).insert({ project, tag, count: 1, createdAt: knex.fn.now(), updatedAt: knex.fn.now() })
      } catch (e) {
        // If unique violation due to race, fallback to update
        await knex(table)
          .where({ project, tag })
          .update({ count: knex.raw('?? + 1', ['count']), updatedAt: knex.fn.now() })
      }
    }
  }

  // decrement
  for (const tag of toDec) {
    await knex(table)
      .where({ project, tag })
      .update({ count: knex.raw('GREATEST(?? - 1, 0)', ['count']), updatedAt: knex.fn.now() })

    await knex(table).where({ project, tag }).andWhere('count', '<=', 0).del()
  }
}

const syncTagsOnCreateOrUpdate = async (context: HookContext<StaticResourceService>) => {
  if (!context.result) return context
  const results = Array.isArray(context.result)
    ? context.result
    : 'data' in context.result
    ? context.result.data
    : [context.result]

  for (const res of results) {
    const newTags = normalizeTags(res.tags as any)
    if (!newTags.length) continue
    await upsertTagCounts(context, res.project, newTags, [])
  }
  return context
}

const syncTagsOnPatch = async (context: HookContext<StaticResourceService>) => {
  if (!context.result) return context
  const results = Array.isArray(context.result)
    ? context.result
    : 'data' in context.result
    ? context.result.data
    : [context.result]

  for (const res of results) {
    const id = res.id
    if (!id) continue
    const prev = await context.app.service(staticResourcePath).get(id)
    const prevTags = normalizeTags(prev.tags as any)
    const newTags = normalizeTags(
      Array.isArray((res as any).tags) ? ((res as any).tags as string[]) : (prev.tags as any)
    )
    const prevProject = prev.project
    const newProject = res.project ?? prev.project

    if (prevProject !== newProject) {
      if (prevTags.length) await upsertTagCounts(context, prevProject, [], prevTags)
      if (newTags.length) await upsertTagCounts(context, newProject, newTags, [])
    } else {
      const { added, removed } = delta(prevTags, newTags)
      if (added.length || removed.length) await upsertTagCounts(context, newProject, added, removed)
    }
  }
  return context
}

const syncTagsOnRemove = async (context: HookContext<StaticResourceService>) => {
  if (!context.result) return context
  const results = Array.isArray(context.result)
    ? context.result
    : 'data' in context.result
    ? context.result.data
    : [context.result]

  for (const res of results) {
    const prevTags = normalizeTags(res.tags as any)
    if (!prevTags.length) continue
    await upsertTagCounts(context, res.project, [], prevTags)
  }
  return context
}

/**
 * Gets the name of the project to which the resource belongs
 * @param context
 * @returns
 */
const getProjectName = async (context: HookContext<StaticResourceService>) => {
  if (!context.id) {
    throw new BadRequest('Static Resource id missing in the request')
  }
  const resource = await context.app.service(staticResourcePath).get(context.id)
  if (!resource) {
    throw new NotFound('resource not found.')
  }
  context.params.query = {
    ...context.params.query,
    project: resource.project
  }
  return context
}

const hasProjectField = (context: HookContext<StaticResourceService>) => {
  return context.params.query?.project != undefined
}

const isKeyPublic = (context: HookContext<StaticResourceService>) => {
  if (context.method !== 'get') throw new BadRequest('isKeyPublic hook only works for get method')
  const result = context.result as StaticResourceType

  if (!result.project) return

  const projectRelativeKey = result.key.replace(`projects/${result.project}/`, '')
  if (!projectRelativeKey.startsWith('public/') && !projectRelativeKey.startsWith('assets/'))
    throw new Forbidden('Cannot access this resource')

  return context
}

const deleteOldThumbnail = async (context: HookContext<StaticResourceService>) => {
  const data = context.data
  const id = context.id
  if (!data || !id) return context
  const resources = Array.isArray(data) ? data : [data]
  for (const resource of resources) {
    if (!resource.thumbnailKey) continue
    const existingResource = await context.app.service(staticResourcePath).get(id, {
      query: {
        $select: ['thumbnailKey']
      }
    })
    if (!existingResource.thumbnailKey || existingResource.thumbnailKey === resource.thumbnailKey) continue
    const resourcesWithOldThumbnail = await context.app.service(staticResourcePath).find({
      query: {
        thumbnailKey: existingResource.thumbnailKey,
        type: { $ne: 'thumbnail' },
        $select: ['id']
      }
    })
    if (resourcesWithOldThumbnail.data.length > 1) {
      logger.warn('Thumbnail is still in use, not deleting')
      continue
    }
    const oldThumbnail = await context.app.service(staticResourcePath).find({
      query: {
        key: existingResource.thumbnailKey,
        $select: ['id']
      }
    })
    if (oldThumbnail.data.length) {
      const oldThumbnailResource = oldThumbnail.data[0]
      if (isValidId(oldThumbnailResource.id))
        await context.app.service(staticResourcePath).remove(oldThumbnailResource.id)
    } else {
      logger.warn('Old thumbnail resource not found')
    }
  }
  return context
}

const resolveThumbnailURL = async (context: HookContext<StaticResourceService>) => {
  if (!context.result) return context
  const data = context.result
  const dataArr = data ? (Array.isArray(data) ? data : 'data' in data ? data.data : [data]) : []

  context.hashedThumbnailResults = {}

  const thumbkeyToIndex = new Map<string, string[]>()
  const storageProvider = getStorageProvider()

  for (const resource of dataArr) {
    /** Thumbnail resources should resolve themselves for their thumbnail fields */
    if (resource.type === 'thumbnail') {
      resource.thumbnailKey = resource.key
      const thumbnailURL = storageProvider.getCachedURL(resource.key, context.params.isInternal)
      const thumbnailURLWithHash = thumbnailURL + '?hash=' + resource.hash.slice(0, 6)
      context.hashedThumbnailResults[resource.id] = thumbnailURLWithHash
    } else {
      if (resource.thumbnailKey) {
        if (!thumbkeyToIndex.has(resource.thumbnailKey)) thumbkeyToIndex.set(resource.thumbnailKey, [])
        thumbkeyToIndex.get(resource.thumbnailKey)?.push(resource.id)
      }
    }
  }

  if (!thumbkeyToIndex.size) return context

  const thumbnailResources = await context.app.service(staticResourcePath).find({
    query: {
      type: 'thumbnail',
      key: {
        $in: [...thumbkeyToIndex.keys()]
      }
    },
    paginate: false
  })

  for (const thumbnailResource of thumbnailResources) {
    const thumbnailURL = storageProvider.getCachedURL(thumbnailResource.key, context.params.isInternal)
    const thumbnailURLWithHash = thumbnailURL + '?hash=' + thumbnailResource.hash.slice(0, 6)
    const ids = thumbkeyToIndex.get(thumbnailResource.key)

    if (!ids) continue
    for (const id of ids) context.hashedThumbnailResults[id] = thumbnailURLWithHash
  }

  return context
}

/**
 * Returns the corresponding action string based on the resource type and action type.
 *
 * @param {string} resourceType - The type of the resource.
 * @param {ActionType} actionType - The type of action being performed.
 * @returns {string} - The action string corresponding to the given resource and action types.
 *
 */
const getActionType = (resourceType: string, actionType: 'delete' | 'patch'): string => {
  const actionsMap = {
    scene: {
      delete: 'SCENE_REMOVED',
      patch: 'SCENE_MODIFIED'
    },
    default: {
      delete: 'RESOURCE_REMOVED',
      patch: 'RESOURCE_MODIFIED'
    }
  }

  return actionsMap[resourceType]?.[actionType] || actionsMap.default[actionType]
}

const addLog = async (context: HookContext<StaticResourceService>, actionType: 'delete' | 'patch') => {
  try {
    const resource = context.result as StaticResourceType

    const project = await context.app.service(projectPath).find({
      query: {
        name: resource.project,
        $limit: 1
      }
    })

    if (isEmpty(project.data)) {
      throw new Error('Project not found')
    }

    const projectId = project.data[0].id

    const action: any = getActionType(resource.type, actionType)

    await context.app.service(projectHistoryPath).create({
      projectId: projectId,
      userId: context.params.user?.id || null,
      action,
      actionIdentifier: resource.id,
      actionIdentifierType: 'static-resource',
      actionDetail: JSON.stringify({
        url: resource.key
      })
    })
  } catch (error) {
    console.error(`Error in adding ${actionType} log:`, error)
  }
}

/**
 * Sync static resource to vector database after create/update
 */
const syncToVectorDatabase = async (context: HookContext<StaticResourceService>) => {
  if (appConfig.vectordb.enabled) {
    try {
      const vectorService = context.app.service(staticResourceVectorPath)
      if (vectorService && typeof vectorService.syncStaticResource === 'function') {
        const staticResource = context.result as StaticResourceType
        const assetClass = FileToAssetType(staticResource.key)

        if (assetClass === AssetType.Material || assetClass === AssetType.Model) {
          await vectorService.syncStaticResource(staticResource)
        }
      }
    } catch (error) {
      console.error('Error syncing to vector database:', error)
      // Don't throw error to avoid breaking the main operation
    }
  }
}

/**
 * Remove static resource from vector database after delete
 */
const removeFromVectorDatabase = async (context: HookContext<StaticResourceService>) => {
  if (appConfig.vectordb.enabled) {
    try {
      const vectorService = context.app.service(staticResourceVectorPath)
      if (vectorService && typeof vectorService.deleteByStaticResourceId === 'function') {
        const staticResourceId = context.id as string
        await vectorService.deleteByStaticResourceId(staticResourceId)
      }
    } catch (error) {
      console.error('Error removing from vector database:', error)
      // Don't throw error to avoid breaking the main operation
    }
  }
}

export default {
  around: {
    all: [schemaHooks.resolveResult(staticResourceResolver)]
  },

  before: {
    all: [],
    find: [
      iff(
        isProvider('external'),
        iffElse(
          (ctx: HookContext) => isAction('admin')(ctx) && checkScope('static_resource', 'read')(ctx),
          [],
          [
            verifyScope('editor', 'write'),
            iffElse(
              hasProjectField,
              [resolveProjectId(), verifyProjectPermission(['owner', 'editor'])],
              [resolveProjectsByPermission()]
            ) as any
          ]
        )
      ),
      enableClientPagination() /** @todo we should either constrain this only for when type='scene' or remove it in favour of comprehensive front end pagination */,
      allowNullQuery('thumbnailKey'),
      discardQuery('action', 'projectId')
    ],
    get: [],
    create: [
      ensureProject,
      iff(
        isProvider('external'),
        iffElse(
          checkScope('static_resource', 'write'),
          [],
          [verifyScope('editor', 'write'), resolveProjectId(), verifyProjectPermission(['owner', 'editor'])]
        )
      ),
      setLoggedinUserInBody('userId'),
      // schemaHooks.validateData(staticResourceDataValidator),
      discardQuery('projectId'),
      schemaHooks.resolveData(staticResourceDataResolver),
      createHashIfNeeded,
      updateName
    ],
    update: [
      ensureProject,
      iff(
        isProvider('external'),
        iffElse(
          checkScope('static_resource', 'write'),
          [],
          [verifyScope('editor', 'write'), resolveProjectId(), verifyProjectPermission(['owner', 'editor'])]
        )
      ),
      setLoggedinUserInBody('userId'),
      // schemaHooks.validateData(staticResourceDataValidator),
      discardQuery('projectId'),
      schemaHooks.resolveData(staticResourceDataResolver),
      createHashIfNeeded,
      updateName
    ],
    patch: [
      iff(
        isProvider('external'),
        iffElse(
          checkScope('static_resource', 'write'),
          [],
          [verifyScope('editor', 'write'), resolveProjectId(), verifyProjectPermission(['owner', 'editor'])]
        )
      ),
      deleteOldThumbnail,
      // schemaHooks.validateData(staticResourcePatchValidator),
      discardQuery('projectId'),
      schemaHooks.resolveData(staticResourcePatchResolver),
      updateName
    ],
    remove: [
      iff(
        isProvider('external'),
        iffElse(
          checkScope('static_resource', 'write'),
          [],
          [
            verifyScope('editor', 'write'),
            getProjectName,
            resolveProjectId(),
            verifyProjectPermission(['owner', 'editor'])
          ]
        )
      ),
      discardQuery('projectId'),
      ensureResource
    ]
  },

  after: {
    all: [],
    find: [resolveThumbnailURL],
    get: [
      resolveThumbnailURL,
      iff(
        isProvider('external'),
        iffElse(
          (ctx: HookContext) => checkScope('static_resource', 'read')(ctx) || verifyScope('editor', 'write')(ctx),
          [],
          [isKeyPublic]
        )
      )
    ],
    create: [updateResourcesJson, syncToVectorDatabase, syncTagsOnCreateOrUpdate],
    update: [updateResourcesJson, syncToVectorDatabase, syncTagsOnCreateOrUpdate],
    patch: [updateResourcesJson, syncToVectorDatabase, syncTagsOnPatch, (context) => addLog(context, 'patch')],
    remove: [removeResourcesJson, removeFromVectorDatabase, syncTagsOnRemove, (context) => addLog(context, 'delete')]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
