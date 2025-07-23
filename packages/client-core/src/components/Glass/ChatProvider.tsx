import { useFind, useMutation } from '@ir-engine/common'
import { InstanceID, messagePath, MessageType } from '@ir-engine/common/src/schema.type.module'
import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'
import { dispatchAction, NetworkState, State, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import React, { createContext, RefObject, useContext, useEffect, useRef } from 'react'
import { ChannelState } from '../../social/services/ChannelService'
import { AvatarUIActions, AvatarUIState } from '../../systems/state/AvatarUIState'
import { AuthState } from '../../user/services/AuthService'

type GroupedMessagesType = MessageType[][]

type ChatMessagesType = {
  messages: State<MessageType[]>
  messageGroupedBySender: GroupedMessagesType
  unreadMessages: State<boolean>
  newMessages: State<{ [mid: MessageType['id']]: boolean }>
  setNewMessage: (messageId: MessageType['id']) => void
}
type ChatInputType = {
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  sendMessage: () => void
  inputRef: RefObject<HTMLInputElement>
  composedMessage: State<string>
  canSendMessage: boolean
}

type ChatProviderType = ChatMessagesType & ChatInputType

const ChatProviderContext = createContext({} as ChatProviderType)

const useChatMessages = (): ChatMessagesType => {
  const messages = useHookstate<MessageType[]>([])
  const newMessages = useHookstate<{ [mid: MessageType['id']]: boolean }>({})
  const unreadMessages = useHookstate(false)
  const user = useMutableState(AuthState).user
  const channelState = useMutableState(ChannelState)
  const targetChannelId = channelState.targetChannelId
  const isChatOpen = true

  const messagesResponse = useFind(messagePath, {
    query: {
      channelId: targetChannelId.value,
      $limit: 100,
      $sort: { createdAt: -1 }
    }
  })

  const setNewMessage = (messageId: MessageType['id']) => {
    newMessages.merge({ [messageId]: true })
    const lightenMessageBackground = setTimeout(() => {
      newMessages.merge({ [messageId]: false })
      clearTimeout(lightenMessageBackground)
    }, 30_000)
  }

  useEffect(() => {
    if (['error', 'pending'].includes(messagesResponse.status)) return
    messages.set(messagesResponse.data.toReversed())
    messagesResponse.data.forEach((message) => {
      if (!(message.id in newMessages.value)) {
        setNewMessage(message.id)
        if (message.senderId !== user.id.value && !message.isNotification) {
          AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.message)
        }
      }
    })
  }, [messagesResponse.data, messagesResponse.status])

  useEffect(() => {
    if (!isChatOpen && messages.at(-1)?.senderId.value !== user.id.value && channelState.messageCreated.value) {
      unreadMessages.set(true)
    } else {
      unreadMessages.set(false)
    }
  }, [channelState.messageCreated, isChatOpen, messages])

  const messageGroupedBySender = messages.value.reduce((grouped: MessageType[][], message) => {
    const lastIndex = grouped.length - 1
    const prevGroup = grouped[lastIndex] || []

    const [prevGroupFirstMessage] = prevGroup

    const isPrevNotification = prevGroupFirstMessage && prevGroupFirstMessage.isNotification

    const isPrevSender = prevGroupFirstMessage && prevGroupFirstMessage.senderId === message.senderId

    if (message.isNotification) {
      grouped.push([message])
      return grouped
    }

    if (isPrevSender && !isPrevNotification) {
      grouped[lastIndex].push(message)
    } else {
      grouped.push([message])
    }

    return grouped
  }, [])

  return {
    messages,
    newMessages,
    unreadMessages,
    setNewMessage,
    messageGroupedBySender
  }
}

const useChatInput = ({ setNewMessage, messages }): ChatInputType => {
  const composedMessage = useHookstate('')
  const targetChannelId = useMutableState(ChannelState).targetChannelId
  const user = useMutableState(AuthState).user
  const usersTyping = useMutableState(AvatarUIState).usersTyping[user?.id.value].value
  const messageMutation = useMutation(messagePath, false)
  const inputRef = useRef<HTMLInputElement>(null)
  const instanceId = NetworkState.worldNetwork?.id as InstanceID

  const canSendMessage = !!instanceId

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const message = event.target.value
    if (message.length > composedMessage.value.length && !usersTyping) {
      dispatchAction(
        AvatarUIActions.setUserTyping({
          typing: true
        })
      )
    } else if ((message.length == 0 || message.length < composedMessage.value.length) && usersTyping) {
      dispatchAction(
        AvatarUIActions.setUserTyping({
          typing: false
        })
      )
    }
    composedMessage.set(message)
  }

  const sendMessage = () => {
    if (!composedMessage.value.trim().length || !instanceId) {
      return
    }

    if (usersTyping) {
      dispatchAction(
        AvatarUIActions.setUserTyping({
          typing: false
        })
      )
    }
    messageMutation
      .create({
        text: composedMessage.value,
        channelId: targetChannelId.value
      })
      .then((message) => {
        setNewMessage(message.id)
        messages.merge([message])
      })
    composedMessage.set('')
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (!composedMessage.value || !usersTyping) return
    const delayDebounce = setTimeout(() => {
      dispatchAction(
        AvatarUIActions.setUserTyping({
          typing: false
        })
      )
    }, 3000)
    return () => clearTimeout(delayDebounce)
  }, [composedMessage.value])

  return {
    canSendMessage,
    handleInputChange,
    sendMessage,
    inputRef,
    composedMessage
  }
}

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const chatMessagesState = useChatMessages()

  const { setNewMessage, messages } = chatMessagesState

  const chatInputState = useChatInput({
    setNewMessage,
    messages
  })

  return (
    <ChatProviderContext.Provider value={{ ...chatMessagesState, ...chatInputState }}>
      {children}
    </ChatProviderContext.Provider>
  )
}

export const useChatProvider = () => useContext(ChatProviderContext)
