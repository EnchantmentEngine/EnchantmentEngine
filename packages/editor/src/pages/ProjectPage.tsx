import React from 'react'

import { EditorNavbar } from '../components/projects/EditorNavbar'
import Projects from '../components/projects/ProjectsPage'

export const ProjectPage = ({ studioPath }: { studioPath: string }) => {
  return (
    <>
      <EditorNavbar />
      <Projects studioPath={studioPath} />
    </>
  )
}
