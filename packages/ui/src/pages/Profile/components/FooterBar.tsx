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

import { useHookstate } from '@ir-engine/hyperflux'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { IoHomeOutline, IoPersonOutline, IoSettingsOutline } from 'react-icons/io5'
import { HomePageState } from '../index'

const FooterBar: React.FC = () => {
  const homeState = useHookstate(HomePageState)

  return (
    <div className="flex h-8 w-full max-w-6xl items-center justify-center gap-4 rounded-lg bg-surface-2 px-4 shadow-md">
      <Button
        variant={homeState.currentView.value === 'home' ? 'primary' : 'secondary'}
        onClick={() => homeState.currentView.set('home')}
        className="flex items-center gap-2"
      >
        <IoHomeOutline />
        Home
      </Button>

      <Button
        variant={homeState.currentView.value === 'profile' ? 'primary' : 'secondary'}
        onClick={() => homeState.currentView.set('profile')}
        className="flex items-center gap-2"
      >
        <IoPersonOutline />
        Profile
      </Button>

      <Button
        variant={homeState.currentView.value === 'settings' ? 'primary' : 'secondary'}
        onClick={() => homeState.currentView.set('settings')}
        className="flex items-center gap-2"
      >
        <IoSettingsOutline />
        Settings
      </Button>
    </div>
  )
}

export default FooterBar
