import { createEngine } from '@ir-engine/ecs/src/Engine'
import { HyperFlux } from '@ir-engine/hyperflux'
import { startTimer } from '@ir-engine/spatial/src/startTimer'
import React from 'react'

import * as ECS from '@ir-engine/ecs'
globalThis.ECS = ECS

createEngine(HyperFlux.store)
startTimer()

export default function ({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
