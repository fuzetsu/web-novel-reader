export const qq = <T extends Element>(query: string, context: Element | Document = document) =>
  Array.from(context.querySelectorAll<T>(query))
export const q = <T extends Element>(query: string, context: Element | Document = document) =>
  context.querySelector<T>(query)

export function repeat<T>(times: number, mapFn: (index: number) => T) {
  return Array.from({ length: times }, (_, index) => mapFn(index))
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
