import { useMutableState } from '@ir-engine/hyperflux'
import { motion } from 'motion/react'
import React from 'react'
import { AuthService, AuthState } from '../../user/services/AuthService'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import { Inner } from '../Glass/ToolbarAndSidebar'
import ButtonGroup from './ButtonGroup'

type DeleteAccountScreenProps = NavigateFuncProps & {}

const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({ navigateTo, navigateClose }) => {
  const { id } = useMutableState(AuthState).user

  const handleDelete = () => {
    // TODO: This is no longer supported
    // AuthService.removeUser(id.value)
    // This will force a full page reload
    AuthService.logoutUser()
  }

  const handleStayHere = () => {
    navigateTo('settings/account')
  }

  return (
    <Inner className="flex min-h-full flex-col items-center justify-between space-y-8 text-center">
      {/* Confirmation Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex h-full flex-1 flex-col items-center justify-center space-y-2"
      >
        <p className="text-lg font-medium text-white/90 md:text-2xl">Are you sure you want to</p>
        <p className="text-lg font-medium text-white/90 md:text-2xl">delete your account?</p>
      </motion.div>

      {/* Action Buttons */}
      <ButtonGroup
        options={[
          { label: 'Stay Here', onClick: handleStayHere },
          { label: 'Delete', onClick: handleDelete }
        ]}
      />
    </Inner>
  )
}

export default DeleteAccountScreen
