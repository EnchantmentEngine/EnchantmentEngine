import { resolve } from '@feathersjs/schema'

import { StaticResourceTagType } from '@ir-engine/common/src/schemas/media/static-resource-tag.schema'

export const staticResourceTagResolver = resolve<StaticResourceTagType, any>({})
