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

import { useMediaNetwork } from '@ir-engine/client-core/src/common/services/MediaInstanceConnectionService'
import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/hooks/useUserAvatarThumbnail'
import { ChannelState } from '@ir-engine/client-core/src/social/services/ChannelService'
import { useFind, useGet, useMutation } from '@ir-engine/common'
import { ChannelID, channelPath, messagePath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { MediaStreamState } from '@ir-engine/network/src/media/MediaStreamState'
import { getChannelName } from '@ir-engine/ui/src/components/Chat/Message'
import { MediaCall } from '@ir-engine/ui/src/components/Chat/VideoCall'
import React, { useEffect, useRef, useState } from 'react'
import { HiPaperClip, HiPhone, HiVideoCamera } from 'react-icons/hi'
import { HiPaperAirplane } from 'react-icons/hi2'
import { NewChatState } from '../ChatState'

export const ConversationWindow: React.FC = () => {
  const chatState = useMutableState(NewChatState)
  const selectedChannelID = chatState.selectedChannelID.value
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: channel } = useGet(channelPath, selectedChannelID!)
  const { data: messages } = useFind(messagePath, {
    query: {
      channelId: selectedChannelID
    }
  })

  const targetChannelId = useHookstate(getMutableState(ChannelState).targetChannelId).value
  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkID = NetworkState.mediaNetwork?.id
  const mediaConnected = mediaNetworkID && mediaNetworkState?.ready.value

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const isCallActive = targetChannelId === selectedChannelID && !!mediaConnected

  const startMediaCall = (video: boolean) => {
    if (!selectedChannelID) return
    if (video) {
      MediaStreamState.toggleWebcamPaused()
    }
    const inChannelCall = targetChannelId === selectedChannelID
    getMutableState(ChannelState).targetChannelId.set(inChannelCall ? ('' as ChannelID) : selectedChannelID)
  }

  if (!selectedChannelID) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white">
        <div className="p-6 text-center">
          <h3 className="mb-2 text-xl font-semibold text-gray-700">Select a conversation</h3>
          <p className="text-gray-500">Choose a conversation from the list or start a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-[#3F3960]">{channel ? getChannelName(channel) : 'Loading...'}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button className="rounded-full p-2 hover:bg-gray-100" onClick={() => startMediaCall(true)}>
            <HiVideoCamera className="h-5 w-5 text-[#3F3960]" />
          </button>
          <button className="rounded-full p-2 hover:bg-gray-100" onClick={() => startMediaCall(false)}>
            <HiPhone className="h-5 w-5 text-[#3F3960]" />
          </button>
        </div>
      </div>

      {/* Call area */}
      {isCallActive && (
        <div className="bg-gray-100 p-4">
          <MediaCall />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageItem key={index} message={message} isSelf={message.sender?.id === Engine.instance.userID} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput channelId={selectedChannelID} />
    </div>
  )
}

interface MessageItemProps {
  message: any
  isSelf: boolean
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isSelf }) => {
  const userThumbnail = useUserAvatarThumbnail(message.sender?.id)

  return (
    <div className={`mb-4 flex items-start ${isSelf ? 'justify-end' : ''}`}>
      {!isSelf && <img src={userThumbnail} alt="User avatar" className="mr-3 mt-1 h-8 w-8 rounded-full" />}
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isSelf ? 'rounded-tr-none bg-[#E1E1E1] text-black' : 'rounded-tl-none bg-[#F8F8F8] text-black'
        }`}
      >
        {!isSelf && <p className="mb-1 text-xs font-medium text-[#3F3960]">{message.sender?.name}</p>}
        <p className="text-sm">{message.text}</p>
      </div>
      {isSelf && <img src={userThumbnail} alt="User avatar" className="ml-3 mt-1 h-8 w-8 rounded-full" />}
    </div>
  )
}

interface MessageInputProps {
  channelId: ChannelID
}

const MessageInput: React.FC<MessageInputProps> = ({ channelId }) => {
  const [message, setMessage] = useState('')
  const mutateMessage = useMutation(messagePath)

  const handleSendMessage = () => {
    if (!message.trim()) return

    mutateMessage.create({
      text: message,
      channelId: channelId
    })

    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center rounded-lg bg-[#F2F3F5] p-1">
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <HiPaperClip className="h-5 w-5" />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border-none bg-transparent px-3 py-2 focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="rounded-md bg-[#3F3960] p-2 text-white hover:bg-[#2D2A45] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={!message.trim()}
        >
          <HiPaperAirplane className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
