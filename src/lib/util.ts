export const p = <T>(first: T, ...rest: unknown[]) => (console.log(first, ...rest), first)

export const qq = <T extends Element>(query: string, context: Element | Document = document) =>
  Array.from(context.querySelectorAll<T>(query))
export const q = <T extends Element>(query: string, context: Element | Document = document) =>
  context.querySelector<T>(query)

export function repeat<T>(times: number, mapFn: (index: number) => T) {
  return Array.from({ length: times }, (_, index) => mapFn(index))
}

export function delayWithCancel(delay: number, action: () => () => void) {
  let cancel: undefined | (() => void)
  const id = setTimeout(() => {
    cancel = action()
  }, delay)
  return () => {
    clearTimeout(id)
    cancel?.()
  }
}

export function promiseWithCancel<T>(promise: Promise<T>, then: (thing: T) => unknown) {
  let cancel = false
  promise.then(thing => {
    if (!cancel) then(thing)
  })
  return () => {
    cancel = true
  }
}

export const scrollToTop = () => window.scrollTo(0, 0)
export const scrollToBottom = () => window.scrollTo(0, document.scrollingElement?.scrollHeight || 0)

export const preventDefault = (fn: () => void) => (evt: Event) => {
  evt.preventDefault()
  fn()
}

export const subURI = (uri: string, subs: { [key: string]: string | number }) =>
  Object.entries(subs).reduce((acc, [k, v]) => acc.replace(':' + k, encodeURIComponent(v)), uri)
