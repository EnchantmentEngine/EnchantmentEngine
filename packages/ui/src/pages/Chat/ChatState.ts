import { ChannelID, UserID } from '@ir-engine/common/src/schema.type.module'
import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'

export type ChatPageType = 'directMessages' | 'workspace' | 'contacts' | 'settings'

export interface WorkspaceChannel {
  id: string
  name: string
  description?: string
  unreadCount?: number
  isJoined?: boolean
  lastMessageTime?: number
}

export interface WorkspaceMember {
  id: UserID
  name: string
  status: 'online' | 'idle' | 'dnd' | 'offline'
  avatar?: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  avatar?: string
  memberCount: number
  channels: WorkspaceChannel[]
  members: WorkspaceMember[]
}

export const NewChatState = defineState({
  name: 'ir.ui.chat.NewChatState',
  initial: () => ({
    // Current active page in the chat UI
    currentPage: 'directMessages' as ChatPageType,

    // Selected channel ID (for messages)
    selectedChannelID: null as ChannelID | null,

    // Selected workspace ID
    selectedWorkspaceID: null as string | null,

    // Selected workspace channel ID
    selectedWorkspaceChannelID: null as string | null,

    // Workspaces data
    workspaces: {
      workspace1: {
        id: 'workspace1',
        name: 'Workspace 1',
        description: 'This is workspace 1',
        avatar: '',
        memberCount: 5,
        channels: [
          { id: 'general', name: 'general', unreadCount: 0, isJoined: true },
          { id: 'announcements', name: 'announcements', unreadCount: 2, isJoined: true },
          { id: 'meeting-room', name: 'meeting-room', unreadCount: 0, isJoined: true },
          { id: 'project-updates', name: 'project-updates', unreadCount: 5, isJoined: true }
        ],
        members: [
          { id: 'user1' as UserID, name: 'User 1', status: 'online' },
          { id: 'user2' as UserID, name: 'User 2', status: 'online' },
          { id: 'user3' as UserID, name: 'User 3', status: 'online' },
          { id: 'user4' as UserID, name: 'User 4', status: 'offline' },
          { id: 'user5' as UserID, name: 'User 5', status: 'offline' }
        ]
      },
      workspace2: {
        id: 'workspace2',
        name: 'Workspace 2',
        description: 'This is workspace 2',
        avatar: '',
        memberCount: 3,
        channels: [
          { id: 'general', name: 'general', unreadCount: 0, isJoined: true },
          { id: 'random', name: 'random', unreadCount: 0, isJoined: true }
        ],
        members: [
          { id: 'user1' as UserID, name: 'User 1', status: 'online' },
          { id: 'user2' as UserID, name: 'User 2', status: 'offline' },
          { id: 'user6' as UserID, name: 'User 6', status: 'online' }
        ]
      }
    } as Record<string, Workspace>,

    // UI state
    showMemberSidebar: true,
    showUserStatusPanel: true,
    showWorkspaceSettings: false,
    showChannelSettings: false,
    memberSearchQuery: ''
  }),
  extension: syncStateWithLocalStorage(['currentPage', 'selectedWorkspaceID', 'showMemberSidebar'])
})
