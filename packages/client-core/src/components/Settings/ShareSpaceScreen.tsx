import { useHookstate } from '@hookstate/core'
import { AnimatePresence } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import React from 'react'
import { useShareMenu } from '../../hooks/useShareMenu'
import { TextButton } from '../Glass/buttons/TextButton'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import { Inner } from '../Glass/ToolbarAndSidebar'
import ShareDrawer from './ShareDrawer'

type ShareSpaceScreenProps = NavigateFuncProps & {}

const ShareSpaceScreen: React.FC<ShareSpaceScreenProps> = () => {
  const { shareLink, copyLinkToClipboard, questLink, inviteLink } = useShareMenu()
  const openDrawer = useHookstate(false)

  return (
    <>
      <Inner className="xs:gap-6 mx-auto flex min-h-full max-w-screen-sm flex-col items-center justify-between pb-[5rem]">
        {/* QR Code */}
        <div className={'flex flex-1 flex-col justify-center'}>
          <div className="rounded-lg bg-white p-4">
            <QRCodeSVG className="h-[130px] w-[130px]" value={shareLink} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-3 text-sm">
          <TextButton onClick={() => copyLinkToClipboard(inviteLink)} className="w-full" fade={`dark`}>
            Copy Direct Link
          </TextButton>

          {/** commenting out in case we need to bring this back */}
          {/* <TextButton onClick={() => copyLinkToClipboard(questLink)} className="w-full" fade={`dark`}>
            Share to Meta Quest
          </TextButton> */}

          <TextButton onClick={() => openDrawer.set(!openDrawer.value)} className="w-full" fade={`dark`}>
            Share by email or phone
          </TextButton>
        </div>
      </Inner>
      <AnimatePresence>{openDrawer.value && <ShareDrawer onClose={() => openDrawer.set(false)} />}</AnimatePresence>
    </>
  )
}

export default ShareSpaceScreen
