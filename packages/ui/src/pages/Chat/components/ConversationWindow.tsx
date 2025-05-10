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
import { EngineState } from '@ir-engine/ecs/src/EngineState'
import { getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { MediaStreamState } from '@ir-engine/network/src/media/MediaStreamState'
import { getChannelName } from '@ir-engine/ui/src/components/Chat/Message'
import { MediaCall } from '@ir-engine/ui/src/components/Chat/VideoCall'
import { Expand06Lg, Maximize02Lg, Screenshare } from '@ir-engine/ui/src/icons'
import React, { useEffect, useRef } from 'react'
import { HiPaperClip, HiPhone, HiVideoCamera } from 'react-icons/hi'
import { HiPaperAirplane } from 'react-icons/hi2'
import { NewChatState } from '../ChatState'
import { MediaSessionState } from '../MediaSessionState'
import { formatMessageTimestamp } from '../utils/dateUtils'

export const ConversationWindow: React.FC = () => {
  const chatState = useMutableState(NewChatState)
  const mediaSessionState = useMutableState(MediaSessionState)
  const selectedChannelID = chatState.selectedChannelID.value
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State for pagination
  const messageLimit = useHookstate(20)
  const isLoadingMore = useHookstate(false)
  const hasMoreMessages = useHookstate(true)
  const scrollPosition = useHookstate(0)

  const { data: channel } = useGet(channelPath, selectedChannelID!)
  const { data: messages } = useFind(messagePath, {
    query: {
      channelId: selectedChannelID,
      $limit: messageLimit.value,
      $sort: { createdAt: 1 }
    }
  })

  const targetChannelId = useHookstate(getMutableState(ChannelState).targetChannelId).value
  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkID = NetworkState.mediaNetwork?.id
  const mediaConnected = mediaNetworkID && mediaNetworkState?.ready.value

  // State to track if user has scrolled up (to prevent auto-scrolling when reading history)
  const isUserScrolled = useHookstate(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Handle scroll events to detect when user scrolls up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10

    // Update state based on scroll position
    isUserScrolled.set(!isScrolledToBottom)

    // Save current scroll position
    scrollPosition.set(scrollTop)

    // Check if user scrolled to the top and we need to load more messages
    if (scrollTop < 50 && !isLoadingMore.value && hasMoreMessages.value && messages.length >= messageLimit.value) {
      loadMoreMessages()
    }
  }

  // Load more messages when scrolling to the top
  const loadMoreMessages = () => {
    if (!hasMoreMessages.value || isLoadingMore.value) return

    isLoadingMore.set(true)

    // Increase the message limit to load more messages
    messageLimit.set(messageLimit.value + 20)
  }

  // Effect to restore scroll position after loading more messages
  useEffect(() => {
    if (isLoadingMore.value && messagesContainerRef.current) {
      // Check if we actually got more messages
      if (messages.length >= messageLimit.value) {
        // Restore scroll position after messages are loaded
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight - scrollPosition.value
      } else {
        // No more messages to load
        hasMoreMessages.set(false)
      }

      isLoadingMore.set(false)
    }
  }, [messages, isLoadingMore.value])

  // Scroll to bottom when new messages arrive, but only if user hasn't scrolled up
  useEffect(() => {
    if (messagesEndRef.current && (!isUserScrolled.value || messages.length <= 1)) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isUserScrolled.value])

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
          {/* Video call button */}
          <button className="rounded-full p-2 hover:bg-gray-100" onClick={() => startMediaCall(true)}>
            <HiVideoCamera className="h-5 w-5 text-[#3F3960]" />
          </button>

          {/* Audio call button */}
          <button className="rounded-full p-2 hover:bg-gray-100" onClick={() => startMediaCall(false)}>
            <HiPhone className="h-5 w-5 text-[#3F3960]" />
          </button>

          {isCallActive && (
            <>
              {/* Screenshare button */}
              <button
                className="rounded-full p-2 hover:bg-gray-100"
                onClick={() => MediaStreamState.toggleScreenshare()}
                title="Share Screen"
              >
                <Screenshare className="h-5 w-5 text-[#3F3960]" />
              </button>

              {/* Expanded view button */}
              <button
                className="rounded-full p-2 hover:bg-gray-100"
                onClick={() => mediaSessionState.isExpanded.set(!mediaSessionState.isExpanded.value)}
                title={mediaSessionState.isExpanded.value ? 'Collapse View' : 'Expand View'}
              >
                <Maximize02Lg className="h-5 w-5 text-[#3F3960]" />
              </button>

              {/* Fullscreen button */}
              <button
                className="rounded-full p-2 hover:bg-gray-100"
                onClick={() => {
                  if (mediaSessionState.isFullscreen.value) {
                    if (document.exitFullscreen) {
                      document.exitFullscreen()
                    }
                    mediaSessionState.isFullscreen.set(false)
                  } else {
                    const mediaContainer = document.getElementById('media-session-container')
                    if (mediaContainer?.requestFullscreen) {
                      mediaContainer.requestFullscreen()
                      mediaSessionState.isFullscreen.set(true)
                    }
                  }
                }}
                title={mediaSessionState.isFullscreen.value ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                <Expand06Lg className="h-5 w-5 text-[#3F3960]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Call area */}
      {isCallActive && (
        <div
          id="media-session-container"
          className={`bg-gray-100 p-4 ${
            mediaSessionState.isExpanded.value && !mediaSessionState.isFullscreen.value
              ? 'fixed bottom-0 right-0 z-40 w-96 rounded-tl-lg shadow-lg'
              : ''
          } ${mediaSessionState.isFullscreen.value ? 'fixed inset-0 z-50' : ''}`}
        >
          <MediaCall />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef} onScroll={handleScroll}>
        {/* Loading indicator for more messages */}
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#3F3960]"></div>
          </div>
        )}

        {/* No messages state */}
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          <>
            {/* Message list */}
            {messages.map((message, index) => (
              <MessageItem key={index} message={message} isSelf={message.sender?.id === getState(EngineState).userID} />
            ))}

            {/* End of messages marker for auto-scrolling */}
            <div ref={messagesEndRef} />
          </>
        )}
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
  const timestamp = message.createdAt ? formatMessageTimestamp(message.createdAt) : ''

  return (
    <div className={`mb-4 flex items-start ${isSelf ? 'justify-end' : ''}`}>
      {!isSelf && <img src={userThumbnail} alt="User avatar" className="mr-3 mt-1 h-8 w-8 rounded-full" />}
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isSelf ? 'rounded-tr-none bg-[#E1E1E1] text-black' : 'rounded-tl-none bg-[#F8F8F8] text-black'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {!isSelf && <p className="text-xs font-medium text-[#3F3960]">{message.sender?.name}</p>}
          <span className="flex-shrink-0 text-xs text-gray-500">{timestamp}</span>
        </div>
        <p className="mt-1 text-sm">{message.text}</p>
      </div>
      {isSelf && <img src={userThumbnail} alt="User avatar" className="ml-3 mt-1 h-8 w-8 rounded-full" />}
    </div>
  )
}

interface MessageInputProps {
  channelId: ChannelID
}

const MessageInput: React.FC<MessageInputProps> = ({ channelId }) => {
  const message = useHookstate('')
  const mutateMessage = useMutation(messagePath)

  const handleSendMessage = () => {
    if (!message.value.trim()) return

    mutateMessage.create({
      text: message.value,
      channelId: channelId
    })

    message.set('')
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
          value={message.value}
          onChange={(e) => message.set(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="rounded-md bg-[#3F3960] p-2 text-white hover:bg-[#2D2A45] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={!message.value.trim()}
        >
          <HiPaperAirplane className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
