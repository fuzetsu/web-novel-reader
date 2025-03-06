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

export function createPersistedState<T>(
  key: Accessor<string>,
  initialValue: T,
) {
  const savedValue = createMemo<T>(() => {
    try {
      const saved = localStorage.getItem(key())
      return (saved && JSON.parse(saved)) ?? initialValue
    } catch (_error: unknown) {
      return initialValue
    }
  })

  // eslint-disable-next-line solid/reactivity -- kept reactive by effect
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

export function useAutoFocus(element: HTMLElement, accessor: () => boolean) {
  createEffect(() => accessor() && element.focus())
}

export function useTrapFocus(elem: HTMLElement, enabled: () => boolean) {
  const getFocusableElements = () =>
    Array.from(
      elem.querySelectorAll<HTMLElement>(
        [
          'button:not([disabled])',
          '[href]:not([disabled])',
          'input:not([disabled])',
          'textarea:not([disabled])',
          'select:not([disabled])',
          'details:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(', '),
      ),
    )

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab' && enabled()) {
      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstFocusableElement = focusableElements.at(0)
      const lastFocusableElement = focusableElements.at(-1)

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement?.focus()
          e.preventDefault()
        }
      }
    }
  }

  createEffect(() => {
    getFocusableElements().at(0)?.focus()
    elem.addEventListener('keydown', handleKeyDown)
    onCleanup(() => elem.removeEventListener('keydown', handleKeyDown))
  })
}
