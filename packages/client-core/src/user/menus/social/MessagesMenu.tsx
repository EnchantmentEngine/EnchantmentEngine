import React from 'react'
import { useTranslation } from 'react-i18next'

import { useFind, useMutation } from '@ir-engine/common'
import { ChannelID, messagePath } from '@ir-engine/common/src/schema.type.module'
import { getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { EngineState } from '@ir-engine/ecs'
import { Input } from '@ir-engine/ui'
import { ArrowLeftLg, Send01Lg } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { MdCall, MdCallEnd } from 'react-icons/md'
import { ModalState } from '../../../common/services/ModalState'
import { useUserAvatarThumbnail } from '../../../hooks/useUserAvatarThumbnail'
import { ChannelService, ChannelState } from '../../../social/services/ChannelService'
import XRIconButton from '../../../systems/components/XRIconButton'
import FriendsMenu from './FriendsMenu'

const MessagesMenu = (props: { channelID: ChannelID; name: string }): JSX.Element => {
  const { t } = useTranslation()

  const userThumbnail = useUserAvatarThumbnail(getState(EngineState).userID)

  const { data: messages } = useFind(messagePath, {
    query: {
      channelId: props.channelID,
      $sort: {
        createdAt: 1
      }
    }
  })

  const channelState = useMutableState(ChannelState)
  const inChannelCall = channelState.targetChannelId.value === props.channelID

  const startMediaCall = () => {
    ChannelService.joinChannelInstance(inChannelCall ? ('' as ChannelID) : props.channelID)
  }

  const SelfMessage = (props: { message: (typeof messages)[0] }) => {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '24px', marginLeft: 'auto' }}>
        <div style={{ height: '20px', marginLeft: '147px', marginRight: '20px' }}>
          <p
            style={{
              borderRadius: '20px',
              border: '2px solid #E1E1E1',
              color: 'black',
              backgroundColor: '#E1E1E1',
              padding: '3px',
              fontFamily: 'var(--lato)'
            }}
          >
            {props.message.text}
          </p>
        </div>
        <img
          style={{ maxWidth: '100%', borderRadius: '38px', width: '36px', height: '36px', objectFit: 'cover' }}
          alt=""
          src={userThumbnail}
        />
      </div>
    )
  }

  const OtherMessage = (props: { message: (typeof messages)[0] }) => {
    const systemMessage = !props.message.sender

    const userThumbnail = useUserAvatarThumbnail(props.message.sender?.id)
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: systemMessage ? 'auto' : '', marginRight: 'auto' }}>
        {!systemMessage && (
          <img
            style={{ maxWidth: '100%', borderRadius: '38px', width: '36px', height: '36px', objectFit: 'cover' }}
            alt=""
            src={userThumbnail}
          />
        )}
        <div style={{ height: '20px', marginLeft: '20px' }}>
          <p
            style={{
              borderRadius: '20px',
              border: systemMessage ? '' : '2px solid #F8F8F8',
              color: 'black',
              backgroundColor: systemMessage ? '' : '#F8F8F8',
              padding: '3px',
              fontFamily: 'var(--lato)'
            }}
          >
            {props.message.text}
          </p>
        </div>
      </div>
    )
  }

  const MessageField = () => {
    const composingMessage = useHookstate('')

    const mutateMessage = useMutation(messagePath)

    const sendMessage = () => {
      mutateMessage.create({
        text: composingMessage.value,
        channelId: props.channelID
      })
      composingMessage.set('')
    }

    const handleMessageKeyDown = (event) => {
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault()
        const selectionStart = (event.target as HTMLInputElement).selectionStart

        composingMessage.set(
          composingMessage.value.substring(0, selectionStart || 0) +
            '\n' +
            composingMessage.value.substring(selectionStart || 0)
        )
        return
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
        return
      }
    }

    return (
      <div style={{ position: 'absolute', bottom: '0px', display: 'flex' }}>
        <Input
          placeholder={t('user:messages.enterMessage')}
          value={composingMessage.value}
          onChange={(e) => composingMessage.set(e.target.value)}
          onKeyDown={(e) => handleMessageKeyDown(e)}
          endComponent={
            <button className="h-4 w-4" onMouseDown={sendMessage}>
              <Send01Lg />
            </button>
          }
          startComponent={
            <img
              style={{ maxWidth: '100%', borderRadius: '38px', width: '16px', height: '16px', objectFit: 'cover' }}
              src={userThumbnail}
            />
          }
        />
        <XRIconButton
          size="large"
          xr-layer="true"
          title={t('user:friends.call')}
          style={{ position: 'absolute', right: '0px' }}
          variant="iconOnly"
          onClick={() => startMediaCall()}
          content={inChannelCall ? <MdCallEnd /> : <MdCall />}
        />
      </div>
    )
  }

  return (
    <div className="absolute z-50 h-fit max-h-[60vh] w-[50vw] min-w-[500px] max-w-2xl overflow-y-auto rounded-2xl bg-surface-1 px-10 py-6">
      <Text fontWeight="semibold" fontSize="lg" component="h2">
        {props.name}
      </Text>
      <XRIconButton
        size="large"
        xr-layer="true"
        className="iconBlock"
        variant="iconOnly"
        onClick={() => ModalState.openModal(<FriendsMenu />)}
        content={<ArrowLeftLg fontSize="larger" />}
      />
      <div style={{ height: '600px', maxWidth: '100%', overflowX: 'hidden' }}>
        <div
          style={{
            height: 'auto',
            marginLeft: '6px',
            marginBottom: '100px',
            marginTop: '4px',
            marginRight: '8px',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap'
          }}
        >
          {messages.map((message, index) => {
            if (message.sender?.id === getState(EngineState).userID)
              return <SelfMessage key={index} message={message} />
            else return <OtherMessage key={index} message={message} />
          })}
        </div>
        <MessageField />
      </div>
    </div>
  )
}

export default MessagesMenu
