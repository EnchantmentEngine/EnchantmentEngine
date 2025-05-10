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

import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { IoPencil } from 'react-icons/io5'

// This is a placeholder for the 3D avatar viewport
// In a real implementation, this would be connected to the 3D engine
const AvatarViewport: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-surface-3 p-4">
      {/* Placeholder for avatar - in real implementation this would be a 3D viewport */}
      <div className="flex h-80 w-64 items-center justify-center rounded-lg bg-gradient-to-b from-ui-primary to-ui-secondary opacity-50">
        <div className="text-center text-white">
          <p className="text-lg font-bold">Avatar Viewport</p>
          <p className="text-sm">3D model would render here</p>
        </div>
      </div>
    </div>
  )
}

const AvatarPanel: React.FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="h-[80%] w-full rounded-lg bg-surface-2 p-4 shadow-md">
        <AvatarViewport />
      </div>

      <Button variant="primary" className="flex items-center gap-2" onClick={() => console.log('Edit avatar clicked')}>
        <IoPencil />
        Edit Avatar
      </Button>
    </div>
  )
}

export default AvatarPanel
