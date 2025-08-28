import { useFind } from '@ir-engine/common'
import { projectsPath } from '@ir-engine/common/src/schema.type.module'
import { NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { loadWebappInjection } from '@ir-engine/projects/loadWebappInjection'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const useLoadWebappInjection = () => {
  const projectComponents = useHookstate(null as null | any[])
  const projects = useFind(projectsPath)

  useEffect(() => {
    if (!projects.data.length || projectComponents.value) return
    loadWebappInjection(projects.data as string[])
      .then((result) => {
        projectComponents.set(result)
      })
      .catch((e) => {
        console.error(`Failed to import webapp load event for project ${projects.data} with reason ${e}`)
        projectComponents.set([])
      })
  }, [projects.data])

  return projectComponents.get(NO_PROXY)
}

export const LoadWebappInjection = (props: { children: React.ReactNode; fallback?: JSX.Element }) => {
  const { t } = useTranslation()
  const projectComponents = useLoadWebappInjection()

  if (!projectComponents) {
    return (
      props.fallback ?? <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingApp')} />
    )
  }

  return (
    <>
      {projectComponents && projectComponents.map((Component, i) => <Component key={i} />)}
      <Suspense fallback={props.fallback}>{props.children}</Suspense>
    </>
  )
}
