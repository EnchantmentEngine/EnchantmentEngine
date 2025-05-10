/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import '@ir-engine/client-core/src/networking/AvatarSpawnSystem'
import '@ir-engine/client-core/src/systems/LoadingUISystem'

import { useEngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@ir-engine/client-core/src/components/World/LoadLocationScene'
import { useBrowserCheck } from '@ir-engine/client-core/src/hooks/useUnsupported'
import UserMenus from '@ir-engine/client-core/src/user/menus'
import { useSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
import { t } from 'i18next'
import React, { useRef } from 'react'
import LoadingView from '../../primitives/tailwind/LoadingView'
import ContentArea from './components/ContentArea'

const HomeScreen = () => {
  useLoadScene({ projectName: 'ir-engine/default-project', sceneName: 'public/scenes/default.gltf' })

  return (
    <div className="pointer-events-auto flex h-screen w-full flex-col items-center justify-between p-4">
      <ContentArea />
      <div className={'absolute bottom-0 left-0 h-fit w-full pb-[inherit]'}>
        <UserMenus />
      </div>
    </div>
  )
}

const HomePage = () => {
  const ref = useRef<HTMLElement>(document.body)

  useSpatialEngine()
  useEngineCanvas(ref)
  useBrowserCheck()

  const projectsLoaded = useEngineInjection()

  if (!projectsLoaded)
    return (
      <div className="relative flex h-dvh w-dvw items-center justify-center bg-white" style={{ zIndex: 100 }}>
        <LoadingView fullScreen animated title={t('common:loader.loadingApp')} titleClassname="text-black" />
      </div>
    )

  return <HomeScreen />
}

export default HomePage
