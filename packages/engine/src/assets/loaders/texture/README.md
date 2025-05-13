# Texture Memory Management System

This system optimizes memory usage by offloading texture data from the CPU/heap after it's been uploaded to the GPU, with the ability to retrieve it when needed.

## Overview

The texture memory management system consists of the following components:

1. **TextureMemoryManager.ts**: Core functionality for offloading and restoring texture data
2. **TexturePatch.ts**: Patches to Three.js Texture classes to handle texture memory management
3. **TextureMemorySystem.ts**: Initialization and management of the texture memory system

## How It Works

1. When a texture is uploaded to the GPU, the system offloads the texture data from memory
2. The texture data is stored in the ResourceCache (IndexedDB) using the texture's URL as the key
3. When the texture is needed again, the system retrieves the data from the cache
4. If the data is not in the cache, the system falls back to loading from the original URL

## Benefits

- Significantly reduces memory usage by offloading texture data after GPU upload
- Works with both regular textures and compressed textures
- Handles mipmaps appropriately
- Uses the existing ResourceCache for persistent storage
- Integrates with the existing resource management system
- Works with standard Three.js textures (no subclassing required)

## Usage

The system is automatically initialized when the engine starts. No additional configuration is required.

### Requirements

For a texture to work with the memory management system:

1. It must have a URL in its userData:
   ```typescript
   texture.userData = { url: 'path/to/texture.jpg' }
   ```

2. It must be properly registered with the resource system

### Manual Usage

If you need to manually offload or restore texture data, you can use the following functions:

```typescript
import { offloadTextureData, restoreTextureData } from '@ir-engine/engine/src/assets/loaders/texture/TextureMemoryManager'

// Offload texture data
await offloadTextureData(texture)

// Restore texture data
await restoreTextureData(texture)
```

### Clearing the Cache

To clear the texture data cache:

```typescript
import { clearTextureDataCache } from '@ir-engine/engine/src/assets/loaders/texture/TextureMemoryManager'

await clearTextureDataCache()
```

To clear the cache for a specific texture:

```typescript
import { clearTextureDataForUrl } from '@ir-engine/engine/src/assets/loaders/texture/TextureMemoryManager'

await clearTextureDataForUrl('path/to/texture.jpg')
```

## Implementation Details

- Uses URLs as keys for caching, assuming they are content-hashed
- Stores texture data in ResourceCache (IndexedDB) for persistence
- Handles different texture types appropriately (regular textures, compressed textures)
- Provides fallback mechanisms if the cache fails
- Patches Three.js Texture classes to handle texture memory management
- Automatically cleans up cache entries when textures are disposed


