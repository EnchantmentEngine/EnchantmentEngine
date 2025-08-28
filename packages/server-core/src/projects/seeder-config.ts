import { KnexSeed } from '@ir-engine/common/src/interfaces/KnexSeed'

import * as projectPermissionTypeSeed from './project-permission-type/project-permission-type.seed'

export const projectSeeds: Array<KnexSeed> = [projectPermissionTypeSeed]
