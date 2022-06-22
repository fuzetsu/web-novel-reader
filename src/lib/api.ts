import { qq } from './util'

const CORS = 'https://cors.fuz.workers.dev/?'

const ABORT_CONTROLLER = new AbortController()
export const cancelRequests = () => ABORT_CONTROLLER.abort()

const fetchDoc = (url: string) =>
  fetch(CORS + url, { signal: ABORT_CONTROLLER.signal })
    .then(res => (res.ok ? res.text() : Promise.reject()))
    .then(html => new DOMParser().parseFromString(html, 'text/html'))

const chapterCache = new Map<string, string[]>()
export const fetchChapter = async (novelId: string, chapter: number) => {
  const cacheKey = novelId + chapter
  const cachedChapter = chapterCache.get(cacheKey)
  if (cachedChapter) return cachedChapter
  const doc = await fetchDoc(`https://novelfull.com/${novelId}/chapter-${chapter}.html`)
  const lines = qq('#chapter-content p', doc).map(paragraph => paragraph.textContent || '')
  chapterCache.set(cacheKey, lines)
  return lines
}
