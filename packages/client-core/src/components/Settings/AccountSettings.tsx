import React from 'react'

import { useMutableState } from '@ir-engine/hyperflux'
import Divider from '@ir-engine/ui/src/components/viewer/Divider'
import { AuthState } from '../../user/services/AuthService'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import { Inner } from '../Glass/ToolbarAndSidebar'
import { MenuItem } from './MenuItem'
import { Section } from './Section'

// Define types for screen components
type ScreenProps = NavigateFuncProps & {}

const AccountSettings: React.FC<ScreenProps> = ({ navigateTo }) => {
  const isGuest = useMutableState(AuthState).user.isGuest.value

  return (
    <Inner className="min-h-full space-y-4">
      <Section>
        <MenuItem label="Display Name" onClick={() => navigateTo('settings/display')} hasChevron />
        {isGuest && (
          <>
            <Divider />
            <MenuItem label="Sign Up" onClick={() => navigateTo('settings/signup')} hasChevron />
          </>
        )}
      </Section>

      {!isGuest && (
        <Section>
          <MenuItem label="Single Sign On" onClick={() => navigateTo('settings/sso')} hasChevron />
        </Section>
      )}
    </Inner>
  )
}

export default AccountSettings
