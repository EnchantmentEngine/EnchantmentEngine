import React from 'react'
import { ChatPageType } from '../ChatState'
import { ContactsPage } from './ContactsPage'
import { DirectMessagesPage } from './DirectMessagesPage'
import { SettingsPage } from './SettingsPage'
import { WorkspacePage } from './WorkspacePage'

interface ContentAreaProps {
  currentPage: ChatPageType
}

export const ContentArea: React.FC<ContentAreaProps> = ({ currentPage }) => {
  return (
    <div className="flex h-full flex-1 overflow-auto bg-[#F2F3F5]">
      {currentPage === 'directMessages' && <DirectMessagesPage />}
      {currentPage === 'workspace' && <WorkspacePage />}
      {currentPage === 'contacts' && <ContactsPage />}
      {currentPage === 'settings' && <SettingsPage />}
    </div>
  )
}
