import ReactJson from '@microlink/react-json-view'
import React, { useEffect, useState } from 'react'

import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import styles from '../styles.module.scss'

/**
 * @param props
 */

export const JsonPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  const [jsonFile, setJsonFile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadJson = () => {
    fetch(url)
      .then((response) => response.json())
      .then((res) => {
        setLoading(false)
        setJsonFile(res)
      })
      .catch((err) => {
        setLoading(false)
        setError(err.message)
      })
  }

  if (jsonFile && loading) loadJson()

  useEffect(() => {
    if (loading) loadJson()
  }, [])

  return (
    <>
      {loading && (
        <div className={styles.container}>
          <LoadingView spinnerOnly className="m-0 inline-block h-10 w-10" />
        </div>
      )}
      {error && (
        <div className={styles.container}>
          <h1 className={styles.error}>{error}</h1>
        </div>
      )}
      {!loading && !error && <ReactJson style={{ height: '100%', overflow: 'auto' }} theme="monokai" src={jsonFile} />}
    </>
  )
}
