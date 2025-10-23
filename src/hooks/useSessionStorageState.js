import { useState, useEffect, useMemo, useCallback } from 'react'

const isBrowser = typeof window !== 'undefined'

const useSessionStorageState = (session, suffix, options = {}) => {
  const { defaultFactory, defaultValue, readValue, writeValue, shouldRemove } = options

  const storageKey = useMemo(() => {
    const base = session ? session.storageKey : null
    if (!base) return null
    return `${base}_${suffix}`
  }, [session, suffix])

  const getDefaultValue = useCallback(() => {
    if (typeof defaultFactory === 'function') {
      return defaultFactory()
    }
    return defaultValue
  }, [defaultFactory, defaultValue])

  const [state, setState] = useState(() => getDefaultValue())

  useEffect(() => {
    if (!storageKey || !isBrowser) {
      setState(getDefaultValue())
      return
    }

    try {
      if (typeof readValue === 'function') {
        const loaded = readValue(storageKey)
        if (loaded !== undefined) {
          setState(loaded)
          return
        }
      } else {
        const raw = window.localStorage.getItem(storageKey)
        if (raw) {
          setState(JSON.parse(raw))
          return
        }
      }
    } catch (error) {
      console.warn(`读取 ${suffix} 失败`, error)
    }

    setState(getDefaultValue())
  }, [getDefaultValue, readValue, storageKey, suffix])

  useEffect(() => {
    if (!storageKey || !isBrowser) return

    try {
      if (typeof shouldRemove === 'function' && shouldRemove(state)) {
        window.localStorage.removeItem(storageKey)
        return
      }

      if (typeof writeValue === 'function') {
        writeValue(storageKey, state)
        return
      }

      window.localStorage.setItem(storageKey, JSON.stringify(state))
    } catch (error) {
      console.warn(`保存 ${suffix} 失败`, error)
    }
  }, [shouldRemove, state, storageKey, suffix, writeValue])

  return [state, setState, storageKey]
}

export default useSessionStorageState
