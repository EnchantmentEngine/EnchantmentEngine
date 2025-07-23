import { vi } from 'vitest'

vi.mock('./hooks', () => ({
  useAssetsCategory: vi.fn().mockReturnValue({
    currentCategoryPath: { set: vi.fn(), get: vi.fn().mockReturnValue('') }
  }),
  useAssetsQuery: vi.fn().mockReturnValue({
    search: {
      value: ''
    },
    refetchResources: vi.fn(),
    staticResourcesPagination: {
      skip: { set: vi.fn() }
    }
  })
}))

// describe('Topbar component', () => {
//   beforeEach(() => {
//     createEngine()
//     render(<Topbar />)
//   })

//   afterEach(() => {
//     destroyEngine()
//     cleanup()
//   })

//   it('should render an `Assets` toolbar element with the data-testid attribute "assets-panel-top-bar"', () => {
//     const panelToolBar = screen.getByTestId('assets-panel-top-bar')
//     expect(panelToolBar).toBeInTheDocument()
//   })

//   it('should render an element with the data-testid attribute "assets-panel-refresh-button"', () => {
//     const refreshButton = screen.getByTestId('assets-panel-refresh-button')
//     expect(refreshButton).toBeInTheDocument()
//   })

//   it('should render an element with the data-testid attribute "assets-panel-create-new-folder-button"', () => {
//     const createNewFolderButton = screen.getByTestId('assets-panel-create-new-folder-button')
//     expect(createNewFolderButton).toBeInTheDocument()
//   })

//   it('should render an element with the data-testid attribute "assets-panel-breadcrumbs"', () => {
//     const breadCrumbs = screen.getByTestId('assets-panel-breadcrumbs')
//     expect(breadCrumbs).toBeInTheDocument()
//   })

//   it('should render an element with the data-testid attribute "view-options-button"', () => {
//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     expect(viewOptionsButton).toBeInTheDocument()
//   })

//   it('should render a pop up menu with icon view options for `Assets` that had an element with the data-testid attribute "files-panel-view-options-icon-size-value-input-group"', () => {
//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const filesPanelViewOptionsIconSizeValueInputGroup = screen.getByTestId(
//       'files-panel-view-options-icon-size-value-input-group'
//     )
//     expect(filesPanelViewOptionsIconSizeValueInputGroup).toBeInTheDocument()
//   })

//   it('should render a pop up menu with icon view options for `Assets` that had an element with the data-testid attribute "slider-text-value-input"', () => {
//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const sliderTextValueInput = screen.getByTestId('slider-text-value-input')
//     expect(sliderTextValueInput).toBeInTheDocument()
//   })

//   it('should render a pop up menu with icon view options for `Assets` that had an element with the data-testid attribute "slider-draggable-value-input"', () => {
//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const sliderDraggableValueInput = screen.getByTestId('slider-draggable-value-input')
//     expect(sliderDraggableValueInput).toBeInTheDocument()
//   })
// })
