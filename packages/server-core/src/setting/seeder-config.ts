import { KnexSeed } from '@ir-engine/common/src/interfaces/KnexSeed'

import * as engineSeed from './engine-setting/engine-setting.seed'

export const settingSeeds: Array<KnexSeed> = [engineSeed]
