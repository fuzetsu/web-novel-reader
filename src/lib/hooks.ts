import {
  Accessor,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from 'solid-js'
import { throttledFn } from './util'

export function useScroll(onScroll: () => void) {
  createEffect(() => {
    window.addEventListener('scroll', onScroll)
    onCleanup(() => window.removeEventListener('scroll', onScroll))
  })
}

export function useDebouncedScroll(ms: number, onScroll: () => void) {
  let id: number
  useScroll(() => {
    clearTimeout(id)
    id = setTimeout(onScroll, ms)
  })
}

export function useThrottledScroll(ms: number, onScroll: () => void) {
  useScroll(throttledFn(ms, onScroll))
}

export function useTimeout(delay: number, fn: () => void) {
  createEffect(() => {
    const id = setTimeout(fn, delay)
    onCleanup(() => clearTimeout(id))
  })
}

export function usePersistedState<T>(key: Accessor<string>, initialValue: T) {
  const savedValue = createMemo<T>(() => {
    try {
      const saved = localStorage.getItem(key())
      return (saved && JSON.parse(saved)) ?? initialValue
    } catch (error: unknown) {
      return initialValue
    }
  })

  const [state, setState] = createSignal(savedValue())
  createEffect(first => {
    const saved = savedValue()
    if (!first) setState(() => saved)
  }, true)

  const persist = throttledFn(500, (newState: T) =>
    localStorage.setItem(key(), JSON.stringify(newState)),
  )
  createEffect(first => {
    const value = state()
    if (!first) persist(value)
  }, true)

  return [state, setState] as const
}

export function useLocationHash() {
  const [hash, setHash] = createSignal(location.hash.slice(2))
  createEffect(() => {
    const handler = () => setHash(location.hash.slice(2))
    window.addEventListener('hashchange', handler)
    onCleanup(() => window.removeEventListener('hashchange', handler))
  })
  return hash
}

export function autoFocus(element: HTMLElement, accesor: () => boolean) {
  createEffect(() => accesor() && element.focus())
}
