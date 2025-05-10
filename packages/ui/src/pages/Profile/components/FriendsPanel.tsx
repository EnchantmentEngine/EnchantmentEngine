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

import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'

// Mock data for friends
const mockFriends = [
  { id: 1, name: 'Alex Johnson', location: 'Sky Station', avatar: 'https://i.pravatar.cc/150?img=1', online: true },
  { id: 2, name: 'Sam Wilson', location: 'Apartment', avatar: 'https://i.pravatar.cc/150?img=2', online: true },
  { id: 3, name: 'Taylor Swift', location: 'Concert Hall', avatar: 'https://i.pravatar.cc/150?img=3', online: true },
  { id: 4, name: 'Jamie Lee', location: 'Offline', avatar: 'https://i.pravatar.cc/150?img=4', online: false },
  { id: 5, name: 'Morgan Chen', location: 'Offline', avatar: 'https://i.pravatar.cc/150?img=5', online: false }
]

interface FriendCardProps {
  name: string
  location: string
  avatar: string
  online: boolean
}

const FriendCard: React.FC<FriendCardProps> = ({ name, location, avatar, online }) => {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface-3 p-3 shadow-sm">
      <div className="relative">
        <AvatarImage src={avatar} size="small" name={name} />
        <div
          className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
            online ? 'bg-ui-success' : 'bg-ui-inactive-primary'
          }`}
        />
      </div>
      <div className="flex flex-col">
        <Text fontSize="sm" fontWeight="semibold" className="text-text-primary">
          {name}
        </Text>
        <Text fontSize="xs" className="text-text-secondary">
          {online ? location : 'Offline'}
        </Text>
      </div>
    </div>
  )
}

const FriendsPanel: React.FC = () => {
  return (
    <div className="flex h-fit flex-col gap-3 rounded-lg bg-surface-2 p-4 shadow-md">
      <div className="mb-2">
        <Text component="h2" fontSize="lg" fontWeight="bold" className="text-text-primary">
          Where your friends are
        </Text>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {mockFriends.map((friend) => (
          <FriendCard
            key={friend.id}
            name={friend.name}
            location={friend.location}
            avatar={friend.avatar}
            online={friend.online}
          />
        ))}
      </div>
    </div>
  )
}

export default FriendsPanel
