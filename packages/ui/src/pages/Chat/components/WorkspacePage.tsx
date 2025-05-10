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

import { useMutableState } from '@ir-engine/hyperflux'
import React from 'react'
import { HiPhone, HiPlus } from 'react-icons/hi'
import { NewChatState } from '../ChatState'
import { ConversationWindow } from './ConversationWindow'

export const WorkspacePage: React.FC = () => {
  const chatState = useMutableState(NewChatState)

  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-64 flex-col border-r border-gray-300 bg-[#F2F3F5]">
        <div className="border-b border-gray-300 p-4">
          <h2 className="text-lg font-bold text-[#3F3960]">Workspace Name</h2>
        </div>

        <div className="border-b border-gray-300 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#787589]">CHANNELS</h3>
            <button
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3F3960] text-white hover:bg-[#2D2A45]"
              title="Add Channel"
            >
              <HiPlus className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex cursor-pointer items-center justify-between rounded p-2 hover:bg-[#E3E5E8]">
              <span className="text-[#3F3960]"># general</span>
              <button className="rounded-full p-1 hover:bg-gray-200">
                <HiPhone className="h-4 w-4 text-[#3F3960]" />
              </button>
            </div>
            <div className="flex cursor-pointer items-center justify-between rounded p-2 hover:bg-[#E3E5E8]">
              <span className="text-[#3F3960]"># announcements</span>
              <button className="rounded-full p-1 hover:bg-gray-200">
                <HiPhone className="h-4 w-4 text-[#3F3960]" />
              </button>
            </div>
            <div className="flex cursor-pointer items-center justify-between rounded p-2 hover:bg-[#E3E5E8]">
              <span className="text-[#3F3960]"># meeting-room</span>
              <button className="rounded-full p-1 hover:bg-gray-200">
                <HiPhone className="h-4 w-4 text-[#3F3960]" />
              </button>
            </div>
            <div className="flex cursor-pointer items-center justify-between rounded p-2 hover:bg-[#E3E5E8]">
              <span className="text-[#3F3960]"># project-updates</span>
              <button className="rounded-full p-1 hover:bg-gray-200">
                <HiPhone className="h-4 w-4 text-[#3F3960]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConversationWindow />

      {chatState.showMemberSidebar.value && (
        <div className="flex h-full w-64 flex-col border-l border-gray-300 bg-[#F2F3F5]">
          <div className="border-b border-gray-300 p-4">
            <h2 className="text-lg font-bold text-[#3F3960]">Members</h2>
          </div>

          <div className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#787589]">ONLINE — 3</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#F2F3F5] bg-[#57C290]"></div>
                </div>
                <span className="ml-2 text-[#3F3960]">User 1</span>
              </div>
              <div className="flex items-center">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#F2F3F5] bg-[#57C290]"></div>
                </div>
                <span className="ml-2 text-[#3F3960]">User 2</span>
              </div>
              <div className="flex items-center">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#F2F3F5] bg-[#57C290]"></div>
                </div>
                <span className="ml-2 text-[#3F3960]">User 3</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#787589]">OFFLINE — 2</h3>
            <div className="space-y-3">
              <div className="flex items-center opacity-60">
                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                <span className="ml-2 text-[#3F3960]">User 4</span>
              </div>
              <div className="flex items-center opacity-60">
                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                <span className="ml-2 text-[#3F3960]">User 5</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
