import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/hooks/useUserAvatarThumbnail'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { EngineState } from '@ir-engine/ecs'
import { getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import React from 'react'
import { HiX } from 'react-icons/hi'
import { NewChatState } from '../ChatState'

export const UserStatusPanel: React.FC = () => {
  const userName = useHookstate(getMutableState(AuthState).user.name).value
  const userThumbnail = useUserAvatarThumbnail(getState(EngineState).userID)
  const chatState = useMutableState(NewChatState)

  // Mock data for recent activity
  const recentActivity = [
    { id: 1, type: 'message', user: 'Alice', time: '2 hours ago' },
    { id: 2, type: 'call', user: 'Bob', time: '5 hours ago' },
    { id: 3, type: 'mention', user: 'Charlie', time: 'Yesterday' }
  ]

  return (
    <div className="flex h-full w-64 flex-col border-l border-gray-300 bg-[#F2F3F5]">
      <div className="flex items-center justify-between border-b border-gray-300 p-4">
        <h2 className="text-lg font-bold text-[#3F3960]">Profile</h2>
        <button className="text-gray-500 hover:text-gray-700" onClick={() => chatState.showUserStatusPanel.set(false)}>
          <HiX className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-center p-4">
        <img src={userThumbnail} alt="User avatar" className="mb-3 h-20 w-20 rounded-full object-cover" />
        <h3 className="text-lg font-bold text-[#3F3960]">{userName}</h3>
        <div className="mt-1 flex items-center">
          <div className="mr-1 h-2.5 w-2.5 rounded-full bg-[#57C290]"></div>
          <p className="text-xs text-[#787589]">Active now</p>
        </div>
      </div>

      <div className="border-t border-gray-300 p-4">
        <h3 className="mb-3 text-sm font-semibold text-[#3F3960]">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="mr-2 mt-1.5 h-2 w-2 rounded-full bg-[#3F3960]"></div>
              <div>
                <p className="text-xs text-[#3F3960]">
                  <span className="font-medium">{activity.user}</span>
                  {activity.type === 'message' && ' sent you a message'}
                  {activity.type === 'call' && ' called you'}
                  {activity.type === 'mention' && ' mentioned you'}
                </p>
                <p className="text-xs text-[#787589]">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-300 p-4">
        <h3 className="mb-3 text-sm font-semibold text-[#3F3960]">Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#787589]">Do Not Disturb</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" />
              <div className="peer h-5 w-9 rounded-full bg-gray-400 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#3F3960] peer-checked:after:translate-x-4"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#787589]">Invisible</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" />
              <div className="peer h-5 w-9 rounded-full bg-gray-400 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#3F3960] peer-checked:after:translate-x-4"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-gray-300 p-4">
        <button className="w-full rounded-md bg-[#3F3960] py-2 text-white transition-colors hover:bg-[#2D2A45]">
          Edit Profile
        </button>
      </div>
    </div>
  )
}
