import { createEngine } from '@ir-engine/ecs/src/Engine'
import { HyperFlux } from '@ir-engine/hyperflux'
import { useSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'

import { startTimer } from '@ir-engine/spatial/src/startTimer'
import { useRef } from 'react'

createEngine(HyperFlux.store)
startTimer()

export default function EngineSandbox() {
  const ref = useRef(document.getElementById('root'))
  useSpatialEngine()
  useEngineCanvas(ref)

  return null
}
