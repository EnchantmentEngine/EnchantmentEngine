import { useMutableState } from '@ir-engine/hyperflux'
import React from 'react'
import { HiChatBubbleLeftRight } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

import { useGet } from '@ir-engine/common'
import { userPath } from '@ir-engine/common/src/schema.type.module'
import { Send01Md } from '@ir-engine/ui/src/icons'
import { cva } from 'class-variance-authority'
import { AuthState } from '../../user/services/AuthService'
import ButtonGroup from '../Settings/ButtonGroup'
import { useChatProvider } from './ChatProvider'
import { useNavigationProvider } from './NavigationProvider'
import { Inner } from './ToolbarAndSidebar'

const messageBaseStyles = `
  inline-grid
  px-4 py-1

  border-2
  border-white/10
  rounded-xl
  shadow-lg

  break-words
  max-w-[80%]
  text-center
`

const blueGradientStyles = `
  bg-gradient-to-r
  from-blue-500
  from-40%

  via-blue-400
  via-90%

  to-blue-400
  to-100%
`

const Notification = ({ children }) => {
  return (
    <div
      className={`
        flex
        text-center
      `}
    >
      {children}
    </div>
  )
}

const OwnMessage = ({ children }) => (
  <div className={twMerge(messageBaseStyles, blueGradientStyles, `self-end`)}>{children}</div>
)

const OtherMessage = ({ children }) => <div className={twMerge(messageBaseStyles, `bg-black/30`)}>{children}</div>

const OtherName = ({ senderId }: { senderId: string }) => {
  const name = useGet(userPath, senderId).data?.name ?? ''
  return <div>{name}</div>
}

const OtherChat = ({ children }) => (
  <div
    className={`
      mb-6 flex flex-col items-start
    `}
  >
    {children}
  </div>
)

const BottomSpacer = () => <div className={`h-12`} />

const inputContainerStyles = `
  flex items-center
  w-full
  p-1
  pl-4
  rounded-full
  bg-black/10
  shadow-inner
`

const inputStyles = `
  bg-transparent
  border-none
  outline-none
  h-full
  w-full
`

const sendButtonStyles = cva(
  `
  flex items-center
  
  p-2

  rounded-full
  text-xl
  border
  border-white/10
`,
  {
    variants: {
      disabled: {
        true: `
        bg-gray-400
        text-gray-300
        cursor-text
      `,
        false: `
        ${blueGradientStyles}
        text-white
        shadow
      `
      },
      show: {
        true: ``,
        false: `invisible`
      }
    }
  }
)

const inputOuterStyles = `
  fixed
  bottom-0
  left-0
  right-0
  bg-black/30
  pb-4 px-4 pt-4
`

export const ChatMenu = () => {
  const user = useMutableState(AuthState).user

  const isGuest = user.isGuest.value
  const onSignUpClicked = () => navigateTo('settings/signup')
  const onSignInClicked = () => navigateTo('settings/login')

  const { messageGroupedBySender, inputRef, handleInputChange, sendMessage, canSendMessage, composedMessage } =
    useChatProvider()
  const { navigateTo } = useNavigationProvider()

  if (isGuest) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col items-center gap-8 pb-20 font-dm-sans">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <HiChatBubbleLeftRight className="mx-auto h-[5.5rem] w-[5.5rem]" />
          <div className="text-shadow font-manrope text-white">Want to chat with others?</div>
        </div>
        <ButtonGroup
          options={[
            { label: 'Create an Account', onClick: onSignUpClicked },
            { label: 'Sign In', onClick: onSignInClicked }
          ]}
        />
      </div>
    )
  }

  const onSubmit = (ev) => {
    ev.preventDefault()

    sendMessage()
  }

  const hasInputText = !!composedMessage.value

  return (
    <Inner className={`mb-20 w-full`}>
      {messageGroupedBySender.map((group, groupIndex) => {
        const [firstMessage] = group
        const isOwnGroup = firstMessage.senderId === user.id.value
        const isNotification = !!firstMessage.isNotification

        const MessageComponent = isNotification ? Notification : isOwnGroup ? OwnMessage : OtherMessage

        const groupedMessage = group.map((message, messageIndex) => {
          return <MessageComponent key={`${groupIndex}-${messageIndex}`}>{message.text}</MessageComponent>
        })

        return isOwnGroup || isNotification ? (
          <div
            key={groupIndex}
            className={twMerge('mb-6 flex w-full flex-col gap-y-2', isNotification ? 'items-center' : 'items-end')}
          >
            {groupedMessage}
          </div>
        ) : (
          <OtherChat key={groupIndex}>
            <OtherName senderId={firstMessage.senderId} />
            {groupedMessage}
          </OtherChat>
        )
      })}

      <div className={inputOuterStyles}>
        <form onSubmit={onSubmit}>
          <div className={inputContainerStyles}>
            <input className={inputStyles} onChange={handleInputChange} ref={inputRef} value={composedMessage.value} />
            <button
              className={sendButtonStyles({
                show: hasInputText,
                disabled: !canSendMessage
              })}
              type={'submit'}
            >
              <Send01Md />
            </button>
          </div>
        </form>
      </div>

      <BottomSpacer />
    </Inner>
  )
}
