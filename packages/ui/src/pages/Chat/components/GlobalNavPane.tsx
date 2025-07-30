import { MessageTextSquare01Lg } from '@ir-engine/ui/src/icons'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { ChatPageType } from '../ChatState'
import { QuickAccess } from './QuickAccess'
import { WorkspaceList } from './WorkspaceList'

interface GlobalNavPaneProps {
  currentPage: ChatPageType
  onPageChange: (page: ChatPageType) => void
}

export const GlobalNavPane: React.FC<GlobalNavPaneProps> = ({ currentPage, onPageChange }) => {
  return (
    <div className="flex h-full w-20 flex-col bg-[#1E1F22] text-white">
      <div className="flex flex-col items-center py-4">
        <button
          className={twMerge(
            'mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-all',
            currentPage === 'directMessages'
              ? 'bg-[#5865F2] text-white'
              : 'bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white'
          )}
          onClick={() => onPageChange('directMessages')}
          title="Direct Messages"
        >
          <MessageTextSquare01Lg className="h-6 w-6" />
        </button>
        <div className="my-2 h-0.5 w-10 bg-gray-700"></div>
      </div>

      <WorkspaceList currentPage={currentPage} onPageChange={onPageChange} />

      <div className="mt-auto">
        <QuickAccess currentPage={currentPage} onPageChange={onPageChange} />
      </div>
    </div>
  )
}
