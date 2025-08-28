import { describe, expect, it } from 'vitest'

import '@ir-engine/engine'
import '@ir-engine/engine/src/avatar/state/AvatarNetworkState'
import { generateThumbnailKey } from './FileThumbnailJobState'

describe('FileThumbnailJobState', () => {
  it('Should generate Thumbnail Key no larger than 50 char', () => {
    const result = generateThumbnailKey(
      'https://ir.world:8642/projects/enchantmentengine/default-project/blah/collisioncube-LOD0.glb',
      'ir-engine'
    )
    console.log(result)
    expect(result.length).toBeLessThanOrEqual(50)
  })
})
