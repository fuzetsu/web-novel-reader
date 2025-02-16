import { RefObject } from 'preact'
import {
  Inputs,
  StateUpdater,
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'preact/hooks'

export function useScroll(onScroll: () => void) {
  const onScrollRef = useUpdatingRef(onScroll)
  useEffect(() => {
    const handleScroll = () => {
      onScrollRef.current()
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
}

export function useDebouncedScroll(ms: number, onScroll: () => void) {
  const idRef = useRef(-1)
  useScroll(() => {
    clearTimeout(idRef.current)
    idRef.current = setTimeout(onScroll, ms)
  })
}

export function useThrottledFn<T extends (...args: never[]) => void>(ms: number, fn: T) {
  const idRef = useRef(-1)
  const lastCallRef = useRef(0)
  const fnRef = useUpdatingRef(fn)

  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(idRef.current)
      const delta = Date.now() - lastCallRef.current
      idRef.current = setTimeout(
        () => {
          lastCallRef.current = Date.now()
          fnRef.current(...args)
        },
        Math.max(0, ms - delta)
      )
    },
    [ms]
  )
}

export function useThrottledScroll(ms: number, onScroll: () => void) {
  useScroll(useThrottledFn(ms, onScroll))
}

export function useUpdatingRef<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

export function useRedraw() {
  return useReducer(c => c + 1, 0)[1] as () => void
}

export function useTimeout(delay: number, fn: () => void, deps: Inputs) {
  const fnRef = useUpdatingRef(fn)
  useEffect(() => {
    const id = setTimeout(() => fnRef.current(), delay)
    return () => clearTimeout(id)
  }, [delay, ...deps])
}

export function usePersistedState<T>(key: string, initialValue: T) {
  const redraw = useRedraw()
  const savedValue = useMemo<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      return (saved && JSON.parse(saved)) ?? initialValue
    } catch (error: unknown) {
      console.error('usePersistedState error:', error)
      return initialValue
    }
  }, [key])
  const stateRef = useRef(savedValue)

  const lastSaved = useRef(savedValue)
  if (lastSaved.current !== savedValue) stateRef.current = savedValue
  lastSaved.current = savedValue

  const persist = useThrottledFn(500, (newState: T) =>
    localStorage.setItem(key, JSON.stringify(newState))
  )

  const update = useCallback<Dispatch<StateUpdater<T>>>(
    stateUpdate => {
      const newState =
        typeof stateUpdate === 'function'
          ? (stateUpdate as (prev: T) => T)(stateRef.current)
          : stateUpdate
      persist(newState)
      stateRef.current = newState
      redraw()
    },
    [persist, redraw]
  )

  return [stateRef.current, update] as const
}

export function useLocationHash() {
  const [hash, setHash] = useState(() => location.hash.slice(2))
  useEffect(() => {
    const handler = () => setHash(location.hash.slice(2))
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])
  return hash
}

export function useAutoFocusRef<T extends HTMLElement>(): [
  autoFocusReF: RefObject<T>,
  focus: () => void
] {
  const ref = useRef<T>(null)
  const [count, reset] = useReducer(x => x + 1, 0)
  useEffect(() => {
    const id = requestAnimationFrame(() => ref.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [count])
  return [ref, reset as () => void]
}
