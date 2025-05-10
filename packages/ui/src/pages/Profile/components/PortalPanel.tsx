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
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { IoEnterOutline } from 'react-icons/io5'

// Mock data for portals/experiences
const mockPortals = [
  { id: 1, name: 'Sky Station', users: 42, thumbnail: 'https://picsum.photos/200/100?random=1' },
  { id: 2, name: 'Apartment', users: 18, thumbnail: 'https://picsum.photos/200/100?random=2' },
  { id: 3, name: 'Concert Hall', users: 156, thumbnail: 'https://picsum.photos/200/100?random=3' },
  { id: 4, name: 'Beach Resort', users: 27, thumbnail: 'https://picsum.photos/200/100?random=4' }
]

interface PortalCardProps {
  name: string
  users: number
  thumbnail: string
}

const PortalCard: React.FC<PortalCardProps> = ({ name, users, thumbnail }) => {
  return (
    <div className="overflow-hidden rounded-lg bg-surface-3 shadow-sm">
      <div className="h-20 w-full bg-cover bg-center" style={{ backgroundImage: `url(${thumbnail})` }} />
      <div className="p-2">
        <div className="flex items-center justify-between">
          <Text fontSize="sm" fontWeight="semibold" className="text-text-primary">
            {name}
          </Text>
          <Text fontSize="xs" className="text-text-secondary">
            {users} users
          </Text>
        </div>
        <Button
          variant="primary"
          size="xs"
          className="mt-1 flex w-full items-center justify-center gap-1"
          onClick={() => console.log(`Enter ${name} clicked`)}
        >
          <IoEnterOutline />
          Enter
        </Button>
      </div>
    </div>
  )
}

const PortalPanel: React.FC = () => {
  return (
    <div className="flex h-fit flex-col gap-3 rounded-lg bg-surface-2 p-4 shadow-md">
      <div className="mb-2">
        <Text component="h2" fontSize="lg" fontWeight="bold" className="text-text-primary">
          Welcome to the XRMetaverse
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto">
        {mockPortals.map((portal) => (
          <PortalCard key={portal.id} name={portal.name} users={portal.users} thumbnail={portal.thumbnail} />
        ))}
      </div>
    </div>
  )
}

export default PortalPanel
