import { fetchChapter, getMaxChapter, Server } from 'lib/api'
import { useLocationHash, usePersistedState, useThrottledScroll } from 'lib/hooks'
import { delayWithCancel, promiseWithCancel, q, qq, repeat, scrollToTop } from 'lib/util'
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'

const SIX_HOURS = 1000 * 60 * 60 * 6
const shouldCheck = (lastCheck: number) => lastCheck < Date.now() - SIX_HOURS

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

  const novelKey = (key: string) => `${novelId}-${key}`

  const [maxChapter, setMaxChapter] = usePersistedState<{
    /** numeric date value representing check time */
    checked: number
    value: number | null
  } | null>(novelKey('max-chap'), null)

  const checkMaxChapter = useCallback(() => setMaxChapter(null), [])

  useEffect(() => {
    let stop = false
    const check = async () => {
      if (!novelId) return
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

  const [filter, setFilter] = usePersistedState(novelKey('filter'), '')

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

  const [chapters, setChapters] = useState<string[][]>([])
  useEffect(() => {
    scrollToTop()
    setChapters([])
    if (!novelId) return
    return delayWithCancel(500, () =>
      promiseWithCancel(
        Promise.all(
          repeat(loadCount, index =>
            fetchChapter(
              server,
              novelId,
              currentChapter + index,
              filter.split('\n').map(x => x.split('|'))
            ).catch(() => ['Error fetching chapter.'])
          )
        ),
        setChapters
      )
    )
  }, [novelId, currentChapter, loadCount, server, filter])

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

  const removeRecent = useCallback(
    (novelId: string) => setRecentNovels(ids => ids.filter(id => id !== novelId)),
    []
  )

  return {
    chapters,
    currentChapter,
    maxChapter,
    filter,
    loadCount,
    newestChapter,
    novelId,
    novelName,
    recentNovels,
    server,
    setCurrentChapter,
    setFilter,
    setLoadCount,
    setNewestChapter,
    setNovelId,
    setServer,
    removeRecent,
    checkMaxChapter
  }
}
