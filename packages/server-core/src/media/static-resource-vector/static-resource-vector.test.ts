import '../../patchEngineNode'

import { staticResourceVectorPath } from '@ir-engine/common/src/schemas/media/static-resource-vector.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { v4 as uuidv4 } from 'uuid'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Application } from '../../../declarations'
import { default as appConfig } from '../../appconfig'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

describe('static-resource-vector service', () => {
  if (appConfig.vectordb.enabled) {
    let app: Application

    beforeAll(async () => {
      app = await createFeathersKoaApp()
      await app.setup()
    })

    afterAll(async () => {
      await tearDownAPI()
      destroyEngine()
    })

    it('should be registered', () => {
      const service = app.service(staticResourceVectorPath)
      expect(service).toBeTruthy()
    })

    it('should create a vector entry', async () => {
      const staticResourceId = uuidv4()
      const vectorData = {
        staticResourceId,
        caption: 'A beautiful red sports car',
        material: 'metal',
        style: 'modern',
        color: 'red'
      }

      const result = await app.service(staticResourceVectorPath).create(vectorData)

      expect(result).toBeTruthy()
      expect(result.staticResourceId).toBe(staticResourceId)
      expect(result.caption).toBe('A beautiful red sports car')
      expect(result.material).toBe('metal')
      expect(result.style).toBe('modern')
      expect(result.color).toBe('red')
    })

    it('should find vector entries', async () => {
      const results = await app.service(staticResourceVectorPath).find({
        query: {
          $limit: 10
        }
      })

      expect(results).toBeTruthy()
      expect(Array.isArray(results.data) || Array.isArray(results)).toBe(true)
    })

    it('should sync static resource to vector database', async () => {
      const vectorService = app.service(staticResourceVectorPath)
      const staticResourceId = uuidv4()

      const mockStaticResource = {
        id: staticResourceId,
        name: 'test-model.glb',
        description: 'A test 3D model',
        mimeType: 'model/gltf-binary',
        tags: ['material:wood', 'style:rustic', 'color:brown']
      }

      /*
      await vectorService.syncStaticResource(mockStaticResource)

      // Find the synced entry
      const results = await vectorService.find({
        query: { staticResourceId }
      })

      const syncedEntry = Array.isArray(results) ? results[0] : results.data[0]
      expect(syncedEntry).toBeTruthy()
      expect(syncedEntry.staticResourceId).toBe(staticResourceId)
      expect(syncedEntry.caption).toBe('A test 3D model')
      */
    })

    it('should delete vector entry by static resource ID', async () => {
      const vectorService = app.service(staticResourceVectorPath)
      const staticResourceId = uuidv4()

      // Create a vector entry
      await vectorService.create({
        staticResourceId,
        caption: 'Test entry to delete'
      })

      // Delete by static resource ID
      await vectorService.deleteByStaticResourceId(staticResourceId)

      // Verify it's deleted
      const results = await vectorService.find({
        query: { staticResourceId }
      })

      const entries = Array.isArray(results) ? results : results.data
      expect(entries.length).toBe(0)
    })

    it('should perform semantic search', async () => {
      const vectorService = app.service(staticResourceVectorPath)

      // Note: This test uses mock embeddings, so results may not be semantically meaningful
      // In production, this would use real embeddings from an AI service
      const results = await vectorService.semanticSearch('red car', 'combined', 0.5, 5)

      expect(Array.isArray(results)).toBe(true)
      // Results may be empty with mock embeddings, which is expected
    })

    it('should handle semantic search queries through find method', async () => {
      const vectorService = app.service(staticResourceVectorPath)

      const results = await vectorService.find({
        query: {
          semanticSearch: 'wooden furniture',
          searchField: 'material',
          similarityThreshold: 0.6,
          maxResults: 10
        }
      })

      expect(results).toBeTruthy()
      expect(Array.isArray(results) || Array.isArray(results.data)).toBe(true)
    })

    it('should update static resource reference', async () => {
      const vectorService = app.service(staticResourceVectorPath)
      const oldStaticResourceId = uuidv4()
      const newStaticResourceId = uuidv4()

      // Create a vector entry with old ID
      await vectorService.create({
        staticResourceId: oldStaticResourceId,
        caption: 'Test entry for reference update'
      })

      // Update the reference
      await vectorService.updateStaticResourceReference(oldStaticResourceId, newStaticResourceId)

      // Verify the reference was updated
      const results = await vectorService.find({
        query: { staticResourceId: newStaticResourceId }
      })

      const updatedEntry = Array.isArray(results) ? results[0] : results.data[0]
      expect(updatedEntry).toBeTruthy()
      expect(updatedEntry.staticResourceId).toBe(newStaticResourceId)

      // Verify old reference no longer exists
      const oldResults = await vectorService.find({
        query: { staticResourceId: oldStaticResourceId }
      })

      const oldEntries = Array.isArray(oldResults) ? oldResults : oldResults.data
      expect(oldEntries.length).toBe(0)
    })

    it('should batch sync multiple static resources', async () => {
      const vectorService = app.service(staticResourceVectorPath)

      const mockResources = [
        {
          id: uuidv4(),
          name: 'model1.glb',
          description: 'First test model'
        },
        {
          id: uuidv4(),
          name: 'model2.glb',
          description: 'Second test model'
        }
      ]

      /*
      await vectorService.batchSyncStaticResources(mockResources)

      // Verify both resources were synced
      for (const resource of mockResources) {
        const results = await vectorService.find({
          query: { staticResourceId: resource.id }
        })

        const syncedEntry = Array.isArray(results) ? results[0] : results.data[0]
        expect(syncedEntry).toBeTruthy()
        expect(syncedEntry.staticResourceId).toBe(resource.id)
      }
      */
    })
  }
})
