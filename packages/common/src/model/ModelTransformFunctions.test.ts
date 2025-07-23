import assert from 'assert'
import { describe, it } from 'vitest'
import { MATCH_ASSET_PROJECT_FILENAME_REGEX } from '../regex'

describe('Model Transform Functions', () => {
  describe('MATCH_ASSET_PROJECT_FILENAME_REGEX', () => {
    it('should match valid asset project paths', () => {
      const validProjectPaths = [
        {
          url: 'https://ir.world:8642/projects/enchantmentengine/default-project/assets/collisioncube-LOD0.glb',
          orgAndProjName: 'enchantmentengine/default-project',
          assetName: 'collisioncube-LOD0.glb'
        },
        {
          url: 'https://ir.world:8642/projects/enchantmentengine/default-project/public/collisioncube-LOD0.glb',
          orgAndProjName: 'enchantmentengine/default-project',
          assetName: 'collisioncube-LOD0.glb'
        },
        {
          url: 'https://ir.world:8642/projects/ir-engine/testproj/assets/collisioncube-LOD0.glb',
          orgAndProjName: 'ir-engine/testproj',
          assetName: 'collisioncube-LOD0.glb'
        },
        {
          url: 'https://ir.world:8642/projects/ir-engine/testproj/public/collisioncube-LOD0.glb',
          orgAndProjName: 'ir-engine/testproj',
          assetName: 'collisioncube-LOD0.glb'
        },
        {
          url: 'https://ir.world:8642/projects/ir-engine/testproj/public/publish/scene/collisioncube-LOD0.glb',
          orgAndProjName: 'ir-engine/testproj',
          assetName: 'collisioncube-LOD0.glb'
        }
      ]

      /**
       * https://ir.world/projects/enchantmentengine/default-project/assets/collisioncube-LOD0.glb
       * Match 1: projects/enchantmentengine/default-project/assets/collisioncube-LOD0.glb
       * Group 1: enchantmentengine/default-project
       * Group 2: collisioncube-LOD0.glb
       */
      validProjectPaths.forEach((filename) => {
        const match = MATCH_ASSET_PROJECT_FILENAME_REGEX.exec(filename.url)
        assert.ok(match, `Expected '${filename.url}' to be valid`)
        assert.equal(
          match?.[1],
          filename.orgAndProjName,
          `Expected org/proj name '${filename.orgAndProjName}' in '${filename.url}'. Found ${match?.[1]}`
        )
        assert.equal(
          match?.[2],
          filename.assetName,
          `Expected asset name '${filename.assetName}' in '${filename.url}'. Found ${match?.[2]}`
        )
      })
    })

    it('should not match invalid asset project paths', () => {
      const invalidProjectPaths = [
        'https://ir.world:8642/projects/enchantmentengine/default-project/blah/collisioncube-LOD0.glb',
        'https://ir.world:8642/projects/enchantmentengine/default-project/custom-prefabs/collisioncube-LOD0.glb'
      ]
      invalidProjectPaths.forEach((filename) => {
        assert.ok(!MATCH_ASSET_PROJECT_FILENAME_REGEX.test(filename), `Expected '${filename}' to be invalid`)
      })
    })
  })
})
