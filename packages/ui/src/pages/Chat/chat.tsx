import '@ir-engine/engine/src/EngineModule'

import '@ir-engine/client-core/src/user/UserUISystem'
import '@ir-engine/client-core/src/world/ClientNetworkModule'

import { useEngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { LocationService } from '@ir-engine/client-core/src/social/services/LocationService'
import { AuthService } from '@ir-engine/client-core/src/user/services/AuthService'
import { clientContextParams } from '@ir-engine/client-core/src/util/ClientContextState'
import multiLogger from '@ir-engine/common/src/logger'
import { getMutableState, NetworkState, useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'

import { ChatPageType, NewChatState } from './ChatState'
import { ContentArea } from './components/ContentArea'
import { FooterBar } from './components/FooterBar'
import { GlobalNavPane } from './components/GlobalNavPane'

import './index.css'

const logger = multiLogger.child({ component: 'ui:chat:newchat', modifier: clientContextParams })

export function ChatPage() {
  AuthService.useAPIListeners()
  LocationService.useLocationBanListeners()

  useEngineInjection()

  const chatState = useMutableState(NewChatState)

  useEffect(() => {
    getMutableState(NetworkState).config.set({
      world: false,
      media: true,
      friends: true,
      instanceID: true,
      roomID: false
    })
    logger.analytics({ event_name: 'world_chat_open', event_value: '' })
    return () => logger.analytics({ event_name: 'world_chat_close', event_value: '' })
  }, [])

  const handlePageChange = (page: ChatPageType) => {
    chatState.currentPage.set(page)
  }

  return (
    <div className="pointer-events-auto flex h-screen w-full flex-col bg-[#E3E5E8]">
      <div className="flex flex-1 overflow-hidden">
        <GlobalNavPane onPageChange={handlePageChange} currentPage={chatState.currentPage.value} />
        <ContentArea currentPage={chatState.currentPage.value} />
      </div>
      <FooterBar />
    </div>
  )
}

export default ChatPage
