import { qq } from './util'

const CORS = 'https://cors.fuz.workers.dev/?'
const NOVEL_ID = 'overgeared'

const ABORT_CONTROLLER = new AbortController()
export const cancelRequests = () => ABORT_CONTROLLER.abort()

const fetchDoc = (url: string) =>
  fetch(CORS + url, { signal: ABORT_CONTROLLER.signal })
    .then(res => res.text())
    .then(html => new DOMParser().parseFromString(html, 'text/html'))

export const fetchChapter = (chapter: number) =>
  fetchDoc(`https://novelfull.com/${NOVEL_ID}/chapter-${chapter}.html`).then(doc =>
    qq('#chapter-content p', doc).map(paragraph => paragraph.textContent || '')
  )
