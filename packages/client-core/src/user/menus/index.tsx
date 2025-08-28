import { useMutableState } from '@ir-engine/hyperflux'
import { EmoteLg, EmoteM, Send01Lg, Send01Md, User01Lg, User01Md } from '@ir-engine/ui/src/icons'

import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import PopupMenu from '@ir-engine/ui/src/primitives/tailwind/PopupMenu'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaUserFriends } from 'react-icons/fa'
import { ModalState } from '../../common/services/ModalState'
import { ViewerMenuState } from '../../util/ViewerMenuState'
import LocationIconButton from '../components/LocationIconButton'
import EmoteMenu from './EmoteMenu'
import ProfileMenu from './ProfileMenu'
import ShareMenu from './ShareMenu'
import FriendsMenu from './social/FriendsMenu'

export default function UserMenus() {
  const userMenus = useMutableState(ViewerMenuState).userMenus
  const { t } = useTranslation()

  return (
    <>
      <div className="flex w-full items-center justify-center gap-x-6">
        {userMenus.profile.value && (
          <LocationIconButton
            tooltip={{
              title: t('user:menu.settings'),
              position: 'top'
            }}
            icon={isMobile ? User01Md : User01Lg}
            data-testid="open-profile-menu"
            onClick={() => ModalState.openModal(<ProfileMenu />)}
          />
        )}
        {userMenus.share.value && (
          <LocationIconButton
            tooltip={{
              title: t('user:menu.sendLocation'),
              position: 'top'
            }}
            icon={isMobile ? Send01Md : Send01Lg}
            data-testid="send-location-button"
            onClick={() => ModalState.openModal(<ShareMenu />)}
          />
        )}
        {userMenus.emote.value && (
          <LocationIconButton
            tooltip={{
              title: t('user:menu.emote'),
              position: 'top'
            }}
            icon={isMobile ? EmoteLg : EmoteM}
            data-testid="open-emote-menu"
            onClick={() => ModalState.openModal(<EmoteMenu />, undefined, 'transparent')}
          />
        )}
        {userMenus.social.value && (
          <LocationIconButton
            tooltip={{
              title: t('user:menu.friends'),
              position: 'top'
            }}
            icon={FaUserFriends}
            data-testid="open-friends-menu"
            onClick={() => ModalState.openModal(<FriendsMenu />)}
          />
        )}
      </div>
      <PopupMenu />
    </>
  )
}
