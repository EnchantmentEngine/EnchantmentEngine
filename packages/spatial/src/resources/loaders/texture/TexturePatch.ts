import { PMREMGenerator, Texture } from 'three'
import { getTextureCacheSize, restoreTextureData, textureNeedsRestoration } from './TextureMemoryManager'

/**
 * Apply patches to Three.js Texture classes to handle texture memory management
 * This adds the necessary functionality without requiring custom subclasses
 */
export function applyTexturePatch() {
  getTextureCacheSize().then((size) => {
    console.log(`Texture cache contains ${size} entries`)
  })

  const originalNeedsUpdateSetter = Object.getOwnPropertyDescriptor(Texture.prototype, 'needsUpdate')?.set

  if (originalNeedsUpdateSetter) {
    Object.defineProperty(Texture.prototype, 'needsUpdate', {
      set: function (value) {
        if (value && textureNeedsRestoration(this)) {
          restoreTextureData(this)
            .then((success) => {
              if (success) {
                originalNeedsUpdateSetter.call(this, value)
              } else {
                originalNeedsUpdateSetter.call(this, value)
              }
            })
            .catch((error) => {
              console.error('Error restoring texture:', error)
              originalNeedsUpdateSetter.call(this, value)
            })
        } else {
          originalNeedsUpdateSetter.call(this, value)
        }
      },
      configurable: true
    })
  }

  const _fromTexture = PMREMGenerator.prototype['_fromTexture']
  PMREMGenerator.prototype['_fromTexture'] = function (texture: Texture, renderTarget: any) {
    if (textureNeedsRestoration(texture)) {
      restoreTextureData(texture).catch((error) => {
        console.error('Error restoring texture for PMREM:', error)
      })
    }

    texture.needsUpdate = true
    return _fromTexture.call(this, texture, renderTarget)
  }
}
