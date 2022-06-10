import { useEffect, useRef } from 'preact/hooks'

export function useScroll(onScroll: () => void) {
  const onScrollRef = useRef(onScroll)
  onScrollRef.current = onScroll
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

export function useThrottledScroll(ms: number, onScroll: () => void) {
  const idRef = useRef(-1)
  const lastCallRef = useRef(0)

  useScroll(() => {
    clearTimeout(idRef.current)
    const delta = Date.now() - lastCallRef.current
    idRef.current = setTimeout(() => {
      lastCallRef.current = Date.now()
      onScroll()
    }, Math.max(0, ms - delta))
  })
}
