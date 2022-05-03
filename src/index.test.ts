import { beforeEach, expect, test } from "@jest/globals"
import { renderHook } from "@testing-library/react"

import { getHashKeyPairs, hasher, useHashedState } from "."

beforeEach(() => {
  localStorage.clear()
})

test("stores an object key ", () => {
  const key = {
    hello: 1,
    world: 2
  }

  const value = "hello world"

  const valueHash = hasher.hash(value)

  const [hashKey, valueKey] = getHashKeyPairs(key)

  renderHook(() => useHashedState(key, value))

  expect(localStorage.getItem(hashKey)).toBe(JSON.stringify(valueHash))
  expect(localStorage.getItem(valueKey)).toBe(JSON.stringify(value))
})
