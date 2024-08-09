import { fetchChapter, getMaxChapter, Server } from 'lib/api'
import { useLocationHash, usePersistedState, useThrottledScroll } from 'lib/hooks'
import {
  applyTextFilter,
  delayWithCancel,
  promiseWithCancel,
  q,
  qq,
  repeat,
  scrollToTop,
  splitNovelText
} from 'lib/util'
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'

type NovelType = 'server' | 'text'

type MaxChapter = {
  /** numeric date value representing check time */
  checked: number
  value: number | null
} | null

const SIX_HOURS = 1000 * 60 * 60 * 6
const shouldCheck = (lastCheck: number) => lastCheck < Date.now() - SIX_HOURS

const CACHE_KEY = 'chapter-cache'

export function useNovelState() {
  const hash = useLocationHash()

  // extract novel/chapter from url hash with format "#/novelId/chapter"
  const [novelId, currentChapter] = useMemo(() => {
    const [novelId, currentChapterStr] = hash.split('/')
    return [novelId || null, Number(currentChapterStr) || 1]
  }, [hash])

  const setNovelId = useCallback(
    (newNovelId: string) => {
      if (newNovelId !== novelId) location.hash = `/${newNovelId}/1`
    },
    [novelId]
  )

  const novelKey = (key: string, prefix = novelId) => `${prefix}-${key}`

  const [offlineChapters, setOfflineChapters] = usePersistedState<{ [chapter: string]: string[] }>(
    novelKey(CACHE_KEY),
    {}
  )

  const [novelType, setNovelType] = usePersistedState<NovelType>(novelKey('type'), 'server')

  const [filter, setFilter] = usePersistedState(novelKey('filter'), '')

  const [novelText, setNovelText] = usePersistedState(novelKey('text'), '')
  const novelTextChapters = useMemo(
    () => splitNovelText(novelText).map(chapter => applyTextFilter(chapter, filter)),
    [novelText, filter]
  )

  const [storedMaxChapter, setMaxChapter] = usePersistedState<MaxChapter>(
    novelKey('max-chap'),
    null
  )

  const maxChapter = useMemo<MaxChapter>(
    () =>
      novelType === 'text'
        ? { checked: Date.now(), value: novelTextChapters.length }
        : storedMaxChapter,
    [novelType, novelTextChapters, storedMaxChapter]
  )

  const checkMaxChapter = useCallback(() => setMaxChapter(null), [])

  useEffect(() => {
    let stop = false
    const check = async () => {
      if (!novelId || novelType !== 'server') return
      if (maxChapter == null || shouldCheck(maxChapter.checked)) {
        console.log('CHECKING MAX CHAPTER', { server, novelId, maxChapter })
        const newMax = await getMaxChapter(server, novelId).catch(() => null)
        console.log('GOT NEW MAX', { server, novelId, newMax })
        if (!stop) setMaxChapter({ checked: Date.now(), value: newMax })
      }
    }
    check()
    return () => {
      stop = true
    }
  }, [novelId, maxChapter])

  const [newestChapter, setNewestChapter] = usePersistedState(novelKey('cur-chap'), 1)
  useEffect(() => {
    if (novelId) setNewestChapter(newest => Math.max(newest, currentChapter))
  }, [currentChapter])

  const [server, setServer] = usePersistedState<Server>(novelKey('server'), 'novel-full')

  const setCurrentChapter = (chapter: number) => {
    location.hash = `/${novelId}/${chapter}`
  }

  const novelName = useMemo(
    () =>
      novelId
        ?.split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
    [novelId]
  )

  const [loadCount, setLoadCount] = usePersistedState(novelKey('load-count'), 1)

  const fetchChapterWithCache = useCallback(
    async (chapter: number) => {
      if (!novelId) return []
      const savedChapter = offlineChapters[chapter]
      if (savedChapter) return savedChapter
      return fetchChapter(server, novelId, chapter)
        .then(chapter => applyTextFilter(chapter, filter))
        .catch(() => ['Error fetching chapter.'])
    },
    [offlineChapters, novelId, server, filter]
  )

  const [chapters, setChapters] = useState<string[][]>([])
  useEffect(() => {
    scrollToTop()
    setChapters([])
    if (!novelId) return
    if (novelType === 'text') {
      setChapters(novelTextChapters.slice(currentChapter - 1))
      return
    }
    return delayWithCancel(500, () =>
      promiseWithCancel(
        Promise.all(repeat(loadCount, index => fetchChapterWithCache(currentChapter + index))),
        setChapters
      )
    )
  }, [novelId, currentChapter, loadCount, server, filter, novelTextChapters])

  // restore scroll position when chapters load
  const [lastPos, setLastPos] = usePersistedState<string | null>(novelKey('last-pos'), null)
  useEffect(() => {
    if (!lastPos || !chapters.length) return
    if (lastPos !== `${currentChapter}-0`) q(`[data-pos="${lastPos}"]`)?.scrollIntoView()
    setLastPos(null)
  }, [lastPos, chapters])

  // track scroll position
  useThrottledScroll(800, () => {
    const pos = qq<HTMLElement>('[data-pos]').find(pos => pos.getBoundingClientRect().bottom > 0)
      ?.dataset.pos
    console.log('saving pos!', pos)
    if (pos) localStorage.setItem(novelKey('last-pos'), JSON.stringify(pos))
  })

  const [recentNovels, setRecentNovels] = usePersistedState<string[]>('recent-novels', [])
  useEffect(() => {
    if (novelId) setRecentNovels([novelId, ...recentNovels.filter(id => id !== novelId)])
  }, [novelId])

  const removeRecent = useCallback((novelId: string) => {
    setRecentNovels(ids => ids.filter(id => id !== novelId))
    // explicitly delete cache because it could be large, other stuff can linger
    localStorage.removeItem(novelKey(CACHE_KEY, novelId))
  }, [])

  const someCurrentChaptersUnsaved = useMemo(() => {
    if (chapters.length < loadCount) return false
    for (let i = 0; i < loadCount; i++) {
      if (!offlineChapters[i + currentChapter]) return true
    }
    return false
  }, [offlineChapters, currentChapter, loadCount, chapters])

  const saveCurrentChapters = useCallback(() => {
    setOfflineChapters(cur =>
      chapters.reduce(
        (acc, chapter, index) => {
          acc[currentChapter + index] = chapter
          return acc
        },
        { ...cur }
      )
    )
  }, [chapters])

  const saveNextChapters = useCallback(
    async (amount: number) => {
      const chapters = await Promise.all(
        repeat(amount, index => fetchChapterWithCache(currentChapter + index))
      )
      setOfflineChapters(cur =>
        chapters.reduce(
          (acc, chapter, index) => {
            acc[currentChapter + index] = chapter
            return acc
          },
          { ...cur }
        )
      )
    },
    [fetchChapterWithCache, currentChapter]
  )

  return {
    chapters,
    checkMaxChapter,
    currentChapter,
    filter,
    loadCount,
    maxChapter,
    newestChapter,
    novelId,
    novelName,
    novelText,
    novelType,
    recentNovels,
    removeRecent,
    server,
    offlineChapters,
    someCurrentChaptersUnsaved,
    saveCurrentChapters,
    saveNextChapters,
    setOfflineChapters,
    setCurrentChapter,
    setFilter,
    setLoadCount,
    setNewestChapter,
    setNovelId,
    setNovelText,
    setNovelType,
    setServer
  }
}
