import React from 'react'
import { HiUserGroup } from 'react-icons/hi'
import { HiCog6Tooth } from 'react-icons/hi2'
import { RiVipCrownFill } from 'react-icons/ri'
import { ChatPageType } from '../ChatState'

interface QuickAccessProps {
  currentPage: ChatPageType
  onPageChange: (page: ChatPageType) => void
}

export const QuickAccess: React.FC<QuickAccessProps> = ({ currentPage, onPageChange }) => {
  const quickAccessItems = [
    { id: 'contacts', name: 'Contacts', icon: <HiUserGroup className="h-6 w-6" />, page: 'contacts' as ChatPageType },
    { id: 'premium', name: 'Premium', icon: <RiVipCrownFill className="h-6 w-6" /> },
    { id: 'settings', name: 'Settings', icon: <HiCog6Tooth className="h-6 w-6" />, page: 'settings' as ChatPageType }
  ]

  return (
    <div className="flex flex-col items-center space-y-2 pb-4">
      {quickAccessItems.map((item) => (
        <button
          key={item.id}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
            currentPage === item.page
              ? 'bg-[#5865F2] text-white'
              : 'bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white'
          }`}
          onClick={() => item.page && onPageChange(item.page)}
          title={item.name}
        >
          {item.icon}
        </button>
      ))}
    </div>
  )
}
