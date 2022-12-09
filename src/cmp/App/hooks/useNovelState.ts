import { fetchChapter, Server } from 'lib/api'
import { useLocationHash, usePersistedState, useThrottledScroll } from 'lib/hooks'
import { delayWithCancel, promiseWithCancel, q, qq, repeat, scrollToTop } from 'lib/util'
import { useEffect, useMemo, useState } from 'preact/hooks'

export function useNovelState() {
  const hash = useLocationHash()

  // extract novel/chapter from url hash with format "#/novelId/chapter"
  const [novelId, currentChapter] = useMemo(() => {
    const [novelId, currentChapterStr] = hash.split('/')
    return [novelId || null, Number(currentChapterStr) || 1]
  }, [hash])

  const setNovelId = (newNovelId: string) => {
    if (newNovelId !== novelId) location.hash = `/${newNovelId}/1`
  }

  const novelKey = (key: string) => `${novelId}-${key}`

  const [newestChapter, setNewestChapter] = usePersistedState(novelKey('cur-chap'), 1)
  useEffect(() => {
    setNewestChapter(Math.max(newestChapter, currentChapter))
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

  const [chapters, setChapters] = useState<string[][]>([])
  useEffect(() => {
    scrollToTop()
    setChapters([])
    if (!novelId) return
    return delayWithCancel(500, () =>
      promiseWithCancel(
        Promise.all(
          repeat(loadCount, index =>
            fetchChapter(server, novelId, currentChapter + index).catch(() => [
              'Error fetching chapter.'
            ])
          )
        ),
        setChapters
      )
    )
  }, [novelId, currentChapter, loadCount, server])

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

  return {
    novelId,
    novelName,
    setNovelId,
    server,
    setServer,
    currentChapter,
    setCurrentChapter,
    newestChapter,
    setNewestChapter,
    loadCount,
    setLoadCount,
    chapters
  }
}
