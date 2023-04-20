import { hasher as createHash } from "node-object-hash"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"

export const DEFAULT_PREFIX = "__use_hashed_state_hook"

export const hasher = createHash({ trim: true, sort: true })

const getItem = (key: string) => {
  try {
    const value = window.localStorage.getItem(key)
    if (value) {
      return JSON.parse(value)
    }
  } catch (error) {
    console.error("error in useHashedState: ", error)
  }

  return undefined
}

const setItem = (key: string, value?: string | any) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export const getHashKeyPairs = (key: any, prefix = DEFAULT_PREFIX) => {
  const hashedKey = hasher.hash(key)
  return [`${prefix}_initial_${hashedKey}`, `${prefix}_value_${hashedKey}`]
}

export const useHashedState = <T = any>(
  key: any,
  initialValue?: T | (() => T),
  prefix = DEFAULT_PREFIX
) => {
  const [hashKey, valueKey] = getHashKeyPairs(key, prefix)

  const [hasSetState, setHasSetState] = useState(false)
  const [state, setState] = useState<T>(
    (typeof window !== "undefined" && getItem(valueKey)) ||
      (initialValue instanceof Function ? initialValue() : initialValue)
  )

  const initialValueHash =
    initialValue === undefined ? undefined : hasher.hash(initialValue)

  useEffect(() => setState(initialValue), [initialValue, initialValueHash])

  useEffect(() => {
    setItem(hashKey, initialValueHash)
  }, [hashKey, initialValueHash])

  useEffect(() => {
    if (hasSetState) {
      setItem(valueKey, state)
    } else {
      setState(
        () =>
          getItem(valueKey) ||
          (initialValue instanceof Function ? initialValue() : initialValue)
      )
      setHasSetState(true)
    }
  }, [key, hasSetState, initialValue, state, valueKey])

  return [state, setState] as [T, Dispatch<SetStateAction<T>>]
}
