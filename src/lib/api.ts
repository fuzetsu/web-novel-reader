import { q, qq, subURI } from './util'

const CORS = 'https://cors.fuz.workers.dev/?'

const ABORT_CONTROLLER = new AbortController()
export const cancelRequests = () => ABORT_CONTROLLER.abort()

const fetchDoc = (url: string) =>
  fetch(CORS + url, { signal: ABORT_CONTROLLER.signal })
    .then(res => (res.ok ? res.text() : Promise.reject()))
    .then(html => new DOMParser().parseFromString(html, 'text/html'))

const makeFilterRegex = (word: string) => new RegExp(`(^|\\b)${word}($|\\b)`, 'gi')

interface TypeDef {
  url: string
  sel: string
  maxChap: { url: string; sel: string | ((doc: Document) => string | null) }
}

const SERVER_CONF = {
  'novel-full': {
    url: 'https://novelfull.net/:novelId/chapter-:chapter.html',
    sel: '#chapter-content p',
    maxChap: { url: 'https://novelfull.net/:novelId.html', sel: '.l-chapters > li:first-child' }
  },
  'divine-dao-library': {
    url: 'https://divinedaolibrary.com/:novelId-chapter-:chapter',
    sel: '.entry-content > p:not([style="text-align:center"])',
    maxChap: { url: 'https://divinedaolibrary.com/category/:novelId', sel: '.entry-title' }
  },
  'wuxiaworld-eu': {
    url: 'https://www.wuxiaworld.eu/chapter/:novelId-:chapter',
    sel: '#chapterText',
    maxChap: {
      url: 'https://www.wuxiaworld.eu/novel/:novelId',
      sel: (doc: Document) => qq('.mantine-Text-root', doc)[7]?.textContent
    }
  }
} as const satisfies { [novelId: string]: TypeDef }

export type Server = keyof typeof SERVER_CONF

export const SERVER_NAMES = Object.keys(SERVER_CONF) as Server[]

// override by novel-id what server is used, eventually user should be able to pick
const SERVER_OVERRIDE: Record<string, Server | undefined> = {
  'humanitys-great-sage': 'divine-dao-library',
  'world-of-cultivation': 'wuxiaworld-eu'
}
export const getServerOverride = (novelId: string) => SERVER_OVERRIDE[novelId]

const getServerConf = (defaultServer: Server, novelId: string) => {
  const server: Server = getServerOverride(novelId) ?? defaultServer
  return SERVER_CONF[server]
}

const chapterCache = new Map<string, string[]>()

export const fetchChapter = async (
  defaultServer: Server,
  novelId: string,
  chapter: number,
  filter: string[][]
) => {
  const cacheKey = defaultServer + novelId + chapter + filter
  const cachedChapter = chapterCache.get(cacheKey)
  if (cachedChapter) return cachedChapter
  const conf = getServerConf(defaultServer, novelId)
  const url = subURI(conf.url, { novelId, chapter })
  const doc = await fetchDoc(url)
  // remove unwanted content from doc before grabbing lines
  qq('script,style', doc).forEach(x => x.remove())

  const cleanFilters = filter
    .filter(([match]) => match)
    .map<[RegExp, string]>(([match, rep]) => [makeFilterRegex(match), rep])

  const lines = qq(conf.sel, doc)
    .map(paragraph =>
      cleanFilters
        .reduce((acc, [regex, rep]) => acc.replace(regex, rep), paragraph.textContent ?? '')
        .trim()
    )
    .filter(Boolean)
  chapterCache.set(cacheKey, lines)
  return lines
}

export const getMaxChapter = async (defaultServer: Server, novelId: string) => {
  const { maxChap } = getServerConf(defaultServer, novelId)
  const url = subURI(maxChap.url, { novelId })
  const doc = await fetchDoc(url)

  const text = (
    typeof maxChap.sel === 'function' ? maxChap.sel(doc) : q(maxChap.sel, doc)?.textContent
  )?.match(/[0-9]+/)?.[0]

  if (!text?.trim()) return null

  const num = Number(text)
  return isNaN(num) ? null : num
}
