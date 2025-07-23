import React from 'react'

import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import Divider from '@ir-engine/ui/src/components/viewer/Divider'
import { MultiplayerState } from '../../common/services/MultiplayerState'
import { AuthService, AuthState } from '../../user/services/AuthService'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import { Inner } from '../Glass/ToolbarAndSidebar'
import ButtonGroup from './ButtonGroup'
import { MenuItem } from './MenuItem'
import { Section } from './Section'
import SliderItem from './SliderItem'
import ToggleItem from './ToggleItem'

// Define types for screen components
type ScreenProps = NavigateFuncProps & {}

const MainMenu: React.FC<ScreenProps> = ({ navigateTo }) => {
  const audioState = useMutableState(AudioState)
  const isGuest = useMutableState(AuthState).user.isGuest.value
  const confirmLogout = useHookstate(false)
  const { world } = useMutableState(MultiplayerState)

  if (confirmLogout.value) {
    return (
      <Inner className="mx-auto flex min-h-full max-w-sm flex-col items-center justify-between">
        <div className="text-dm-sans m-auto flex w-full flex-1 flex-col justify-center text-center text-2xl text-white">
          Are you sure you want to logout?
        </div>
        <ButtonGroup
          options={[
            { label: 'Logout', onClick: () => AuthService.logoutUser() },
            { label: 'Nevermind', onClick: () => confirmLogout.set(false) }
          ]}
        />
      </Inner>
    )
  }

  return (
    <Inner className="space-y-4">
      {/* Communication Section */}
      <Section>
        <MenuItem label="Share Space" onClick={() => navigateTo('settings/share')} hasChevron />
      </Section>
      <Section>
        <SliderItem
          label="Mic Volume"
          value={audioState.microphoneGain.value * 100}
          onChange={(value) => audioState.microphoneGain.set(value / 100)}
        />
        <Divider />
        <SliderItem
          label="Audio Volume"
          value={audioState.masterVolume.value * 100}
          onChange={(value) => audioState.masterVolume.set(value / 100)}
        />
      </Section>

      {/* World & Account Section */}
      <Section>
        <ToggleItem label="Multiplayer" checked={world.value} onClick={() => world.set(!world.value)} />
        <Divider />
        <MenuItem label="Account" onClick={() => navigateTo('settings/account')} hasChevron />
        <Divider />
        <MenuItem label="Avatar" onClick={() => navigateTo('settings/avatar')} hasChevron />
      </Section>

      {/* System Section */}
      <Section>
        <MenuItem label="Controls" onClick={() => navigateTo('settings/controls')} hasChevron />
        <Divider />
        <MenuItem label="Graphics" onClick={() => navigateTo('settings/graphics')} hasChevron />
        <Divider />
        <MenuItem label="Audio" onClick={() => navigateTo('settings/audio')} hasChevron />
        {!isGuest && (
          <>
            <Divider />
            <MenuItem label="Log Out" onClick={() => confirmLogout.set(true)} />
          </>
        )}
      </Section>
    </Inner>
  )
}

export default MainMenu
