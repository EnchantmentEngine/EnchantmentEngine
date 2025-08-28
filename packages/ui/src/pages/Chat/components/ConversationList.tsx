import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/hooks/useUserAvatarThumbnail'
import { useFind } from '@ir-engine/common'
import { ChannelID, channelPath, ChannelType } from '@ir-engine/common/src/schema.type.module'
import { EngineState } from '@ir-engine/ecs/src/EngineState'
import { getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { HiPlus, HiSearch } from 'react-icons/hi'
import { NewChatState } from '../ChatState'
import { formatMessageTimestamp } from '../utils/dateUtils'

export const getChannelName = (channel: ChannelType) => {
  return (
    channel.name ||
    channel.channelUsers
      .filter((channelUser) => channelUser.user?.id !== getState(EngineState).userID)
      .map((channelUser) => channelUser.user?.name)
      .filter(Boolean)
      .join(', ')
  )
}

interface ConversationListProps {
  onNewMessage?: () => void
}

export const ConversationList: React.FC<ConversationListProps> = ({ onNewMessage }) => {
  const chatState = useMutableState(NewChatState)
  const searchQuery = useHookstate('')

  const { data: channels } = useFind(channelPath, {
    query: {
      instanceId: null
    }
  })

  const sortedChannels = [...channels].sort((a, b) => {
    const aLatestMessageTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
    const bLatestMessageTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
    return bLatestMessageTime - aLatestMessageTime
  })
  const isLoading = channels.length === 0

  useEffect(() => {
    return () => {
      chatState.selectedChannelID.set(null)
    }
  }, [])

  const handleChannelSelect = (channelId: ChannelID) => {
    chatState.selectedChannelID.set(channelId)
  }

  const filteredChannels = sortedChannels.filter((channel) =>
    getChannelName(channel).toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-300 bg-[#F2F3F5]">
      <div className="flex items-center justify-between border-b border-gray-300 p-4">
        <h2 className="text-xl font-bold text-[#3F3960]">Direct Messages</h2>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3F3960] text-white hover:bg-[#2D2A45]"
          onClick={onNewMessage}
          title="New Message"
        >
          <HiPlus className="h-5 w-5" />
        </button>
      </div>

      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full rounded-md bg-[#E3E5E8] py-2 pl-8 pr-4 text-sm focus:outline-none"
            value={searchQuery.value}
            onChange={(e) => searchQuery.set(e.target.value)}
          />
          <HiSearch className="absolute left-2.5 top-2.5 text-gray-500" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-20 items-center justify-center">
            <p>Loading conversations...</p>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-gray-500">
            <p>No conversations found</p>
          </div>
        ) : (
          filteredChannels.map((channel) => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              isSelected={chatState.selectedChannelID.value === channel.id}
              onSelect={handleChannelSelect}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface ChannelItemProps {
  channel: any
  isSelected: boolean
  onSelect: (channelId: ChannelID) => void
}

const ChannelItem: React.FC<ChannelItemProps> = ({ channel, isSelected, onSelect }) => {
  const messageText = channel.lastMessage?.text || '...'
  const messageTimestamp = channel.lastMessage?.createdAt ? formatMessageTimestamp(channel.lastMessage.createdAt) : ''

  const userThumbnail = useUserAvatarThumbnail(
    channel.channelUsers.find((user: any) => user.userId !== getState(EngineState).userID)?.userId || ''
  )

  return (
    <div
      className={`flex cursor-pointer items-center gap-3 p-3 hover:bg-[#E3E5E8] ${isSelected ? 'bg-[#D4D7DC]' : ''}`}
      onClick={() => onSelect(channel.id)}
    >
      <img src={userThumbnail} alt="Channel avatar" className="h-10 w-10 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate font-medium text-[#3F3960]">{getChannelName(channel)}</p>
          {messageTimestamp && <p className="ml-2 flex-shrink-0 text-xs text-[#787589]">{messageTimestamp}</p>}
        </div>
        <p className="truncate text-xs text-[#787589]">{messageText}</p>
      </div>
    </div>
  )
}
