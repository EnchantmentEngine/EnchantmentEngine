import { Extension } from '@gltf-transform/core'

export abstract class CopyableExtension extends Extension {
  abstract copyTo(target: Extension | null): void
}
