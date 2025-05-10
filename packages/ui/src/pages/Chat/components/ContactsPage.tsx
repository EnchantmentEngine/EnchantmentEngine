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

import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/hooks/useUserAvatarThumbnail'
import { FriendService, FriendState } from '@ir-engine/client-core/src/social/services/FriendService'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { HiCheck, HiUserAdd, HiX } from 'react-icons/hi'

export const ContactsPage: React.FC = () => {
  const friendState = useMutableState(FriendState)

  useEffect(() => {
    FriendService.getUserRelationship(Engine.instance.userID)
  }, [])

  const friends = friendState.relationships.value
    .filter((friend) => friend.userRelationshipType === 'friend')
    .map((friend) => ({
      id: friend.relatedUserId,
      name: friend.relatedUser.name
    }))

  const pendingRequests = friendState.relationships.value
    .filter((friend) => friend.userRelationshipType === 'requested')
    .map((friend) => ({
      id: friend.relatedUserId,
      name: friend.relatedUser.name
    }))

  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-1/3 flex-col border-r border-gray-300 bg-[#F2F3F5]">
        <div className="border-b border-gray-300 p-4">
          <h2 className="text-lg font-bold text-[#3F3960]">Friend Requests</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {pendingRequests.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-gray-500">
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <RequestItem key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-300 p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Add friend by username..."
              className="w-full rounded-md bg-[#E3E5E8] py-2 pl-4 pr-10 text-sm focus:outline-none"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 transform text-[#3F3960]">
              <HiUserAdd className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full w-1/3 flex-col border-r border-gray-300 bg-white">
        <div className="border-b border-gray-300 p-4">
          <h2 className="text-lg font-bold text-[#3F3960]">Contacts</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {friends.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-gray-500">
              <p>No contacts yet</p>
              <p className="text-sm">Add friends to get started</p>
            </div>
          ) : (
            <div>
              <div className="border-b border-gray-200 p-3">
                <h3 className="text-xs font-semibold text-[#787589]">ONLINE — {friends.length}</h3>
              </div>
              {friends.map((friend) => (
                <ContactItem key={friend.id} contact={friend} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex h-full w-1/3 flex-col bg-[#F2F3F5]">
        <div className="border-b border-gray-300 p-4">
          <h2 className="text-lg font-bold text-[#3F3960]">Activity</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <ActivityItem type="message" user="Alice" content="sent you a message" time="2 hours ago" />
            <ActivityItem type="friend" user="Bob" content="accepted your friend request" time="5 hours ago" />
            <ActivityItem type="call" user="Charlie" content="missed your call" time="Yesterday" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface RequestItemProps {
  request: {
    id: string
    name: string
  }
}

const RequestItem: React.FC<RequestItemProps> = ({ request }) => {
  const userThumbnail = useUserAvatarThumbnail(request.id)

  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center">
        <img src={userThumbnail} alt="User avatar" className="h-10 w-10 rounded-full object-cover" />
        <div className="ml-3">
          <p className="font-medium text-[#3F3960]">{request.name}</p>
          <p className="text-xs text-[#787589]">Wants to add you as a friend</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button className="rounded-full bg-[#57C290] p-1.5 text-white hover:bg-[#45A97A]">
          <HiCheck className="h-5 w-5" />
        </button>
        <button className="rounded-full bg-[#F87171] p-1.5 text-white hover:bg-[#EF4444]">
          <HiX className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

interface ContactItemProps {
  contact: {
    id: string
    name: string
  }
}

const ContactItem: React.FC<ContactItemProps> = ({ contact }) => {
  const userThumbnail = useUserAvatarThumbnail(contact.id)

  return (
    <div className="flex cursor-pointer items-center p-3 hover:bg-[#F2F3F5]">
      <div className="relative">
        <img src={userThumbnail} alt="User avatar" className="h-10 w-10 rounded-full object-cover" />
        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#57C290]"></div>
      </div>
      <div className="ml-3">
        <p className="font-medium text-[#3F3960]">{contact.name}</p>
        <p className="text-xs text-[#787589]">Online</p>
      </div>
    </div>
  )
}

interface ActivityItemProps {
  type: 'message' | 'friend' | 'call'
  user: string
  content: string
  time: string
}

const ActivityItem: React.FC<ActivityItemProps> = ({ type, user, content, time }) => {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center">
        <div className="h-8 w-8 rounded-full bg-gray-300"></div>
        <div className="ml-3">
          <p className="font-medium text-[#3F3960]">{user}</p>
          <p className="text-xs text-[#787589]">{time}</p>
        </div>
      </div>
      <p className="text-sm text-[#3F3960]">{content}</p>
    </div>
  )
}
