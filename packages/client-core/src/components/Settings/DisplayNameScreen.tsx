import { useHookstate } from '@hookstate/core'
import { USERNAME_MAX_LENGTH } from '@ir-engine/common/src/constants/UserConstants'
import multiLogger from '@ir-engine/common/src/logger'
import { INVALID_USER_NAME_REGEX } from '@ir-engine/common/src/regex'
import { UserName } from '@ir-engine/common/src/schema.type.module'
import { useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect, useMemo } from 'react'
import { AuthState } from '../../user/services/AuthService'
import { AvatarService } from '../../user/services/AvatarService'
import { clientContextParams } from '../../util/ClientContextState'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import { Inner } from '../Glass/ToolbarAndSidebar'
import { TextButton } from '../Glass/buttons/TextButton'
import FieldItem from './FieldItem'
import { Section } from './Section'

type DisplayNameScreenProps = NavigateFuncProps & {}
const logger = multiLogger.child({ component: 'engine:ecs:DisplayName', modifier: clientContextParams })

const DisplayNameScreen: React.FC<DisplayNameScreenProps> = () => {
  const { name, id } = useMutableState(AuthState).user
  const displayName = useHookstate(name.value as string)
  const saved = useHookstate(false)

  const isUsernameValid = useMemo(() => {
    const validInput = displayName.value.replace(INVALID_USER_NAME_REGEX, '')
    return validInput.length > 0 && validInput.length <= USERNAME_MAX_LENGTH
  }, [displayName.value])

  const onSave = () => {
    const name = displayName.value.trim() as UserName
    if (!name) return
    AvatarService.updateUsername(id.value, name).then(() => {
      saved.set(true)
      logger.analytics({
        event_name: 'rename_user'
      })
    })
  }

  useEffect(() => {
    if (saved.value) {
      setTimeout(() => {
        saved.set(false)
      }, 2000)
    }
  }, [saved.value])

  return (
    <Inner className="flex min-h-full flex-col justify-between gap-4">
      <Section>
        <FieldItem
          label="Display Name"
          value={displayName.value}
          onChange={(value) => {
            if (value.length <= USERNAME_MAX_LENGTH) displayName.set(value)
          }}
          isDirty={displayName.value !== name.value}
          onReset={() => displayName.set(name.value as string)}
        />
      </Section>
      <TextButton disabled={!isUsernameValid} onClick={onSave} className="mx-auto justify-self-end">
        {saved.value ? 'Saved!' : 'Save'}
      </TextButton>
    </Inner>
  )
}

export default DisplayNameScreen
