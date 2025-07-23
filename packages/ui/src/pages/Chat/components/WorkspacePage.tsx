import { useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import { NewChatState } from '../ChatState'
import { ChannelSidebar } from './ChannelSidebar'
import { ConversationWindow } from './ConversationWindow'
import { MemberSidebar } from './MemberSidebar'
import { WorkspaceHeader } from './WorkspaceHeader'

export const WorkspacePage: React.FC = () => {
  const chatState = useMutableState(NewChatState)
  const workspaceId = chatState.selectedWorkspaceID.value || 'workspace1'

  const workspaceState = chatState.workspaces[workspaceId]

  useEffect(() => {
    if (!chatState.selectedWorkspaceChannelID.value && workspaceState.channels.value.length > 0) {
      const firstChannelId = workspaceState.channels.value[0].id
      chatState.selectedWorkspaceChannelID.set(firstChannelId)
    }
  }, [workspaceState.channels])

  const toggleMemberSidebar = () => {
    chatState.showMemberSidebar.set(!chatState.showMemberSidebar.value)
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-64 flex-col border-r border-gray-300 bg-[#F2F3F5]">
        <WorkspaceHeader workspace={workspaceState.value} />
        <ChannelSidebar workspace={workspaceState.value} />
      </div>

      <div className="relative flex-1">
        <ConversationWindow />
        <button
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#E3E5E8] hover:bg-[#D4D7DC]"
          onClick={toggleMemberSidebar}
          title={chatState.showMemberSidebar.value ? 'Hide member list' : 'Show member list'}
        >
          {chatState.showMemberSidebar.value ? (
            <HiEyeOff className="h-5 w-5 text-[#3F3960]" />
          ) : (
            <HiEye className="h-5 w-5 text-[#3F3960]" />
          )}
        </button>
      </div>

      {chatState.showMemberSidebar.value && <MemberSidebar workspace={workspaceState.value} />}
    </div>
  )
}
