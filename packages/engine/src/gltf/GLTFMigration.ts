import { GLTF } from '@gltf-transform/core'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'

export type GLTFMigrationType = (gltf: GLTF.IGLTF) => void

export const GLTFMigration = defineState({
  name: 'ir.engine.gltf.GLTFMigration',
  initial: [] as { name: string; order: number; migration: GLTFMigrationType }[],

  register: (name: string, migration: GLTFMigrationType, order: number = 0) => {
    const state = getMutableState(GLTFMigration)
    state.set((curr) => {
      const next = [...curr]
      next.push({ name, order, migration })
      return next.sort((a, b) => a.order - b.order)
    })
  },

  unregister: (name: string) => {
    const state = getMutableState(GLTFMigration)
    state.set((curr) => {
      const next = [...curr]
      const index = next.findIndex((migration) => migration.name === name)
      if (index !== -1) {
        next.splice(index, 1)
      }
      return next
    })
  },

  migrate: (gltf: GLTF.IGLTF) => {
    const migrations = getState(GLTFMigration)
    for (const { migration } of migrations) {
      migration(gltf)
    }
  }
})
