import { qq, subURI } from './util'

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
  ['puhe', 'poo hey'],
  ['sou', 'so']
].map(([word, rep]) => [new RegExp(`\\b${word}\\b`, 'gi'), rep])

const SERVER_CONF = {
  'novel-full': {
    url: 'https://novelfull.com/:novelId/chapter-:chapter.html',
    sel: '#chapter-content p'
  },
  'divine-dao-library': {
    url: 'https://divinedaolibrary.com/:novelId-chapter-:chapter',
    sel: '.entry-content > p:not([style="text-align:center"])'
  },
  'wuxiaworld-eu': {
    url: 'https://www.wuxiaworld.eu/chapter/:novelId-:chapter',
    sel: '#chapterText'
  }
} as const

export type Server = keyof typeof SERVER_CONF

export const SERVER_NAMES = Object.keys(SERVER_CONF) as Server[]

// override by novel-id what server is used, eventually user should be able to pick
const SERVER_OVERRIDE: Record<string, Server | undefined> = {
  'humanitys-great-sage': 'divine-dao-library',
  'world-of-cultivation': 'wuxiaworld-eu'
}

const chapterCache = new Map<string, string[]>()

export const fetchChapter = async (defaultServer: Server, novelId: string, chapter: number) => {
  const cacheKey = defaultServer + novelId + chapter
  const cachedChapter = chapterCache.get(cacheKey)
  if (cachedChapter) return cachedChapter
  const server: Server = SERVER_OVERRIDE[novelId] ?? defaultServer
  const conf = SERVER_CONF[server]
  const url = subURI(conf.url, { novelId, chapter })
  const doc = await fetchDoc(url)
  // remove unwanted content from doc before grabbing lines
  qq('script,style', doc).forEach(x => x.remove())
  const lines = qq(conf.sel, doc)
    .map(paragraph =>
      TTS_BREAK_FILTER.reduce(
        (acc, [regex, rep]) => acc.replace(regex, rep),
        paragraph.textContent ?? ''
      ).trim()
    )
    .filter(Boolean)
  chapterCache.set(cacheKey, lines)
  return lines
}
