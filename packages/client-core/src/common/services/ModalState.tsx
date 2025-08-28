import { defineState, getMutableState } from '@ir-engine/hyperflux'

type BackdropType = 'blur' | 'transparent'

export interface ModalData {
  element: JSX.Element | null
  onClickOutside: VoidFunction
}

/**
 * Modal state for tailwind routes
 */
export const ModalState = defineState({
  name: 'ee.client.ModalState',
  initial: {
    modals: [] as ModalData[],
    backdrop: 'blur' as BackdropType
  },

  /**shows a modal.
   * if a previous modal was already present, the `element` modal will be current showed */
  openModal: (
    element: JSX.Element,
    onClickOutside?: ModalData['onClickOutside'],
    backdrop = 'blur' as BackdropType
  ) => {
    getMutableState(ModalState).modals.merge([
      {
        element,
        onClickOutside: onClickOutside || ModalState.closeModal
      }
    ])
    if (backdrop === 'transparent') {
      /* if atleast one Modal is asking to use transparent backdrop, all the Modals "in this nesting" will use transparent backdrop. */
      getMutableState(ModalState).backdrop.set('transparent')
    }
  },
  /**close the current modal.
   * if a previous modal was present, the previous one will be shown */
  closeModal: () => {
    const currentCount = getMutableState(ModalState).modals.length
    getMutableState(ModalState).modals.set((prevElements) => {
      prevElements.pop()
      return prevElements
    })
    if (currentCount === 1) {
      /* if the current modal is the last one, the backdrop will be reset to blur */
      getMutableState(ModalState).backdrop.set('blur')
    }
  },
  /**Returns true if there are any open modals, false otherwise, based on the length of the elements array in ModalState.*/
  isModalOpen: () => getMutableState(ModalState).modals.length > 0
})
