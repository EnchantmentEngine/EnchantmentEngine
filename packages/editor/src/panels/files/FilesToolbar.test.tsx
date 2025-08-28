import { vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

// describe('FilesToolbar component', () => {
//   beforeEach(() => {
//     createEngine()
//     getMutableState(FilesViewModeState).viewMode.set('icons')
//     render(<FilesToolbar />)
//   })

//   afterEach(() => {
//     destroyEngine()
//     cleanup()
//   })

//   it('should render an `Files` toolbar container element with the data-testid attribute "files-panel-top-bar"', () => {
//     const filesPanelTopBar = screen.getByTestId('files-panel-top-bar')
//     expect(filesPanelTopBar).toBeInTheDocument()
//   })

//   it('should render an `Files` toolbar container with an element that has the data-testid attribute "files-panel-refresh-directory-button"', () => {
//     const refreshButton = screen.getByTestId('files-panel-refresh-directory-button')
//     expect(refreshButton).toBeInTheDocument()
//   })

//   it('should render an `Files` toolbar container with an element that has the data-testid attribute "files-panel-create-new-folder-button"', () => {
//     const createNewFolderButton = screen.getByTestId('files-panel-create-new-folder-button')
//     expect(createNewFolderButton).toBeInTheDocument()
//   })

//   it('should render an `Files` toolbar container with an element that has the data-testid attribute "view-options-button"', () => {
//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     expect(viewOptionsButton).toBeInTheDocument()
//   })

//   it('should render an `Files` toolbar container with an element that has the data-testid attribute "files-panel-download-project-button"', () => {
//     const downloadProjectButton = screen.getByTestId('files-panel-download-project-button')
//     expect(downloadProjectButton).toBeInTheDocument()
//   })

//   it('should render an `Files` toolbar container with an element that has the data-testid attribute "files-panel-view-mode-list-button"', () => {
//     const viewModeListButton = screen.getByTestId('files-panel-view-mode-list-button')
//     expect(viewModeListButton).toBeInTheDocument()
//   })

//   it('should render an `Files` toolbar container with an element that has the data-testid attribute "files-panel-view-mode-icons-button"', () => {
//     const viewModeIconsButton = screen.getByTestId('files-panel-view-mode-icons-button')
//     expect(viewModeIconsButton).toBeInTheDocument()
//   })

//   it('should render an `Files` toolbar container with an element that has the data-testid attribute "files-panel-upload-files-button"', () => {
//     const uploadFilesButton = screen.getByTestId('files-panel-upload-files-button')
//     expect(uploadFilesButton).toBeInTheDocument()
//   })

//   it('should render an `Files` toolbar container with an element that has the data-testid attribute "files-panel-upload-folder-button"', () => {
//     const uploadFolderButton = screen.getByTestId('files-panel-upload-folder-button')
//     expect(uploadFolderButton).toBeInTheDocument()
//   })

//   it('should render an `Files` toolbar container with an element that has the data-testid attribute "files-panel-search-input"', () => {
//     const searchBar = screen.getByTestId('files-panel-search-input')
//     expect(searchBar).toBeInTheDocument()
//   })

//   it('should render a menu element with the data-testid "files-panel-view-options-icon-size-value-input-group"', () => {
//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const filesPanelViewOptionsIconSizeValueInputGroup = screen.getByTestId(
//       'files-panel-view-options-icon-size-value-input-group'
//     )
//     expect(filesPanelViewOptionsIconSizeValueInputGroup).toBeInTheDocument()
//   })

//   it('should render a menu element with the data-testid "slider-text-value-input"', () => {
//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const sliderTextValueInput = screen.getByTestId('slider-text-value-input')
//     expect(sliderTextValueInput).toBeInTheDocument()
//   })

//   it('should render a menu element with the data-testid "slider-draggable-value-input"', () => {
//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const sliderDraggableValueInput = screen.getByTestId('slider-draggable-value-input')
//     expect(sliderDraggableValueInput).toBeInTheDocument()
//   })

//   it('should render a menu element with the data-testid "slider-draggable-value-input"', () => {
//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const sliderDraggableValueInput = screen.getByTestId('slider-draggable-value-input')
//     expect(sliderDraggableValueInput).toBeInTheDocument()
//   })

//   it('should render a pop up menu with a list view option for `Files` that has the data-testid attribute "files-panel-view-mode-list-options-column-name"', () => {
//     getMutableState(FilesViewModeState).viewMode.set('list')

//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const listOptionsColumnName = screen.getByTestId('files-panel-view-mode-list-options-column-name')
//     expect(listOptionsColumnName).toBeInTheDocument()
//   })

//   it('should render a pop up menu with a list view option for `Files` that has the data-testid attribute "files-panel-view-mode-list-options-column-type"', () => {
//     getMutableState(FilesViewModeState).viewMode.set('list')

//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const listOptionsColumnType = screen.getByTestId('files-panel-view-mode-list-options-column-type')
//     expect(listOptionsColumnType).toBeInTheDocument()
//   })

//   it('should render a pop up menu with a list view option for `Files` that has the data-testid attribute "files-panel-view-mode-list-options-column-author"', () => {
//     getMutableState(FilesViewModeState).viewMode.set('list')

//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const listOptionsColumnAuthor = screen.getByTestId('files-panel-view-mode-list-options-column-author')
//     expect(listOptionsColumnAuthor).toBeInTheDocument()
//   })

//   it('should render a pop up menu with a list view option for `Files` that has the data-testid attribute "files-panel-view-mode-list-options-column-createdAt"', () => {
//     getMutableState(FilesViewModeState).viewMode.set('list')

//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const listOptionsColumnCreatedAt = screen.getByTestId('files-panel-view-mode-list-options-column-createdAt')
//     expect(listOptionsColumnCreatedAt).toBeInTheDocument()
//   })

//   it('should render a pop up menu with a list view option for `Files` that has the data-testid attribute "files-panel-view-mode-list-options-column-statistics"', () => {
//     getMutableState(FilesViewModeState).viewMode.set('list')

//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const listOptionsColumnStatistics = screen.getByTestId('files-panel-view-mode-list-options-column-statistics')
//     expect(listOptionsColumnStatistics).toBeInTheDocument()
//   })

//   it('should render a pop up menu with a list view option for `Files` that has the data-testid attribute "files-panel-view-mode-list-options-column-size"', () => {
//     getMutableState(FilesViewModeState).viewMode.set('list')

//     const viewOptionsButton = screen.getByTestId('view-options-button')
//     fireEvent.click(viewOptionsButton)

//     const listOptionsColumnSize = screen.getByTestId('files-panel-view-mode-list-options-column-size')
//     expect(listOptionsColumnSize).toBeInTheDocument()
//   })
// })
