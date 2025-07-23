import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/hooks/useUserAvatarThumbnail'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import React from 'react'

export const FooterBar: React.FC = () => {
  const userName = useHookstate(getMutableState(AuthState).user.name).value
  const userThumbnail = useUserAvatarThumbnail(Engine.instance.userID)

  const isOnline = useHookstate(true)

  const toggleStatus = () => {
    isOnline.set(!isOnline.value)
  }

  return (
    <div className="flex h-16 w-full items-center bg-[#ECECEC] px-4">
      <div className="flex items-center space-x-3">
        <img src={userThumbnail} alt="User avatar" className="h-10 w-10 rounded-full object-cover" />
        <div>
          <p className="font-bold text-[#3F3960]">{userName}</p>
          <div className="flex items-center space-x-1">
            <div className={`h-2.5 w-2.5 rounded-full ${isOnline.value ? 'bg-[#57C290]' : 'bg-[#b3b5b9]'}`}></div>
            <p className="text-xs text-[#787589]">{isOnline.value ? 'Active now' : 'Inactive'}</p>
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        <label className="relative inline-flex cursor-pointer items-center">
          <input type="checkbox" className="peer sr-only" checked={isOnline.value} onChange={toggleStatus} />
          <div className="peer h-5 w-10 rounded-full bg-gray-400 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#3F3960] peer-checked:after:translate-x-5"></div>
        </label>

        <button className="text-gray-600 hover:text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
