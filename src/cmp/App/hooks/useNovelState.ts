import { fetchChapter, getMaxChapter, Server } from '@/lib/api'
import {
  useLocationHash,
  usePersistedState,
  useThrottledScroll,
} from '@/lib/hooks'
import {
  applyTextFilter,
  delayWithCancel,
  p,
  promiseWithCancel,
  q,
  qq,
  repeat,
  scrollToTop,
  splitNovelText,
} from '@/lib/util'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'

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
  const novelId = () => hash().split('/')[0] ?? null
  const currentChapter = () => Number(hash().split('/')[1] ?? 1)

  const setNovelId = (newNovelId: string) => {
    if (newNovelId !== novelId()) location.hash = `/${newNovelId}/1`
  }

  const novelKey =
    (key: string, prefix: string | null = null) =>
    () =>
      `${prefix ?? novelId()}-${key}`

  const [offlineChapters, setOfflineChapters] = usePersistedState<{
    [chapter: string]: string[]
  }>(novelKey(CACHE_KEY), {})

  const [novelType, setNovelType] = usePersistedState<NovelType>(
    novelKey('type'),
    'server',
  )

  const [filter, setFilter] = usePersistedState(novelKey('filter'), '')

  const [novelText, setNovelText] = usePersistedState(novelKey('text'), '')
  const novelTextChapters = createMemo(() =>
    splitNovelText(novelText()).map(chapter =>
      applyTextFilter(chapter, filter()),
    ),
  )

  const [storedMaxChapter, setMaxChapter] = usePersistedState<MaxChapter>(
    novelKey('max-chap'),
    null,
  )

  const maxChapter = createMemo<MaxChapter>(() =>
    novelType() === 'text'
      ? { checked: Date.now(), value: novelTextChapters().length }
      : storedMaxChapter(),
  )

  const checkMaxChapter = () => setMaxChapter(null)

  createEffect(() => {
    let stop = false
    const id = novelId()
    const max = maxChapter()
    const check = async () => {
      if (!id || novelType() !== 'server') return
      if (max == null || shouldCheck(max.checked)) {
        const newMax = await getMaxChapter(server(), id).catch(() => null)
        if (!stop) setMaxChapter({ checked: Date.now(), value: newMax })
      }
    }
    check()

    onCleanup(() => {
      stop = true
    })
  })

  const [newestChapter, setNewestChapter] = usePersistedState(
    novelKey('cur-chap'),
    1,
  )
  createEffect(() => {
    if (novelId() && currentChapter() > newestChapter()) {
      setNewestChapter(currentChapter())
    }
  })

  const [server, setServer] = usePersistedState<Server>(
    novelKey('server'),
    'novel-full',
  )

  const setCurrentChapter = (chapter: number) => {
    location.hash = `/${novelId()}/${chapter}`
  }

  const novelName = createMemo(() =>
    novelId()
      ?.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
  )

  const [loadCount, setLoadCount] = usePersistedState(novelKey('load-count'), 1)

  const fetchChapterWithCache = (chapter: number) => {
    if (!novelId()) return []
    const savedChapter = offlineChapters()[chapter]
    if (savedChapter) return savedChapter
    return fetchChapter(server(), novelId(), chapter).catch(() => [
      'Error fetching chapter.',
    ])
  }

  const [chapters, setChapters] = createSignal<string[][]>([])
  createEffect(() => {
    scrollToTop()
    setChapters([])
    if (!novelId()) return
    if (novelType() === 'text') {
      setChapters(novelTextChapters().slice(currentChapter() - 1))
      return
    }

    const count = loadCount()
    const curChap = currentChapter()

    onCleanup(
      delayWithCancel(500, () =>
        promiseWithCancel(
          Promise.all(
            repeat(count, index => fetchChapterWithCache(index + curChap)),
          ),
          setChapters,
        ),
      ),
    )
  })

  const filteredChapters = createMemo(() =>
    chapters().map(chapter => applyTextFilter(chapter, filter())),
  )

  // restore scroll position when chapters load
  const [lastPos, setLastPos] = usePersistedState<string | null>(
    novelKey('last-pos'),
    null,
  )
  createEffect(() => {
    const pos = lastPos()
    if (!pos || !chapters().length) return
    if (pos !== `${currentChapter()}-0`)
      q(`[data-pos="${pos}"]`)?.scrollIntoView()
    setLastPos(null)
  })

  // track scroll position
  useThrottledScroll(800, () => {
    const pos = qq<HTMLElement>('[data-pos]').find(
      pos => pos.getBoundingClientRect().bottom > 0,
    )?.dataset.pos
    if (pos) {
      localStorage.setItem(
        novelKey('last-pos')(),
        JSON.stringify(p(pos, 'saving pos')),
      )
    }
  })

  const [recentNovels, setRecentNovels] = usePersistedState<string[]>(
    () => 'recent-novels',
    [],
  )
  createEffect(() => {
    const id = novelId()
    if (id) setRecentNovels(recents => [id, ...recents.filter(x => x !== id)])
  })

  const removeRecent = (novelId: string) => {
    setRecentNovels(ids => ids.filter(id => id !== novelId))
    // explicitly delete cache because it could be large, other stuff can linger
    localStorage.removeItem(novelKey(CACHE_KEY, novelId)())
  }

  const someCurrentChaptersUnsaved = createMemo(() => {
    if (chapters().length < loadCount()) return false
    for (let i = 0; i < loadCount(); i++) {
      if (!offlineChapters()[i + currentChapter()]) return true
    }
    return false
  })

  const saveCurrentChapters = () => {
    setOfflineChapters(cur =>
      chapters().reduce(
        (acc, chapter, index) => {
          acc[currentChapter() + index] = chapter
          return acc
        },
        { ...cur },
      ),
    )
  }

  const saveNextChapters = async (amount: number) => {
    const chapters = await Promise.all(
      repeat(amount, index => fetchChapterWithCache(currentChapter() + index)),
    )
    setOfflineChapters(cur =>
      chapters.reduce(
        (acc, chapter, index) => {
          acc[currentChapter() + index] = applyTextFilter(chapter, filter())
          return acc
        },
        { ...cur },
      ),
    )
  }

  return {
    chapters: filteredChapters,
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
    setServer,
  }
}
