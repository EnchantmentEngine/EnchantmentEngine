import * as ECS from '@ir-engine/ecs'
import * as Engine from '@ir-engine/engine'
import * as Hyperflux from '@ir-engine/hyperflux'
import * as Spatial from '@ir-engine/spatial'

import * as React from 'react'
import * as THREE from 'three'

const IR = {
  Hyperflux,
  ECS,
  Spatial,
  Engine
}

const Modules = {
  IR,
  THREE,
  React
}

globalThis.__MODULES__ = Modules
