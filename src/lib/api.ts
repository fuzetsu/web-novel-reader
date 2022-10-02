import { qq } from './util'

const CORS = 'https://cors.fuz.workers.dev/?'

const ABORT_CONTROLLER = new AbortController()
export const cancelRequests = () => ABORT_CONTROLLER.abort()

const fetchDoc = (url: string) =>
  fetch(CORS + url, { signal: ABORT_CONTROLLER.signal })
    .then(res => (res.ok ? res.text() : Promise.reject()))
    .then(html => new DOMParser().parseFromString(html, 'text/html'))

// these words by themselves in a paragraph break ios speak screen
const TTS_BREAK_FILTER: [RegExp, string][] = [
  ['hu', 'who'],
  ['pue', 'poo'],
  ['sou', 'so']
].map(([word, rep]) => [new RegExp(`\\b${word}\\b`, 'gi'), rep])

const chapterCache = new Map<string, string[]>()

export const fetchChapter = async (novelId: string, chapter: number) => {
  const cacheKey = novelId + chapter
  const cachedChapter = chapterCache.get(cacheKey)
  if (cachedChapter) return cachedChapter
  const doc = await fetchDoc(`https://novelfull.com/${novelId}/chapter-${chapter}.html`)
  const lines = qq('#chapter-content p', doc).map(paragraph =>
    TTS_BREAK_FILTER.reduce(
      (acc, [regex, rep]) => acc.replace(regex, rep),
      paragraph.textContent ?? ''
    )
  )
  chapterCache.set(cacheKey, lines)
  return lines
}
