import { ChooseNovelModal } from 'cmp/ChooseNovelModal'
import { RecentNovels } from 'cmp/RecentNovels'
import { prettyTime, preventDefault, repeat, scrollToTop } from 'lib/util'
import { useState } from 'preact/hooks'
import { Chapter } from '../Chapter'
import { CurrentChapterControl } from '../CurrentChapterControl'
import { LoadCountControl } from '../LoadCountControl'
import { ScrollControl } from '../ScrollControl'
import { useNovelState } from './hooks'

export function App() {
  const {
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
    removeRecent
  } = useNovelState()

  const resumeNewestChapter = preventDefault(() => setCurrentChapter(newestChapter))
  const clearResume = preventDefault(() => setNewestChapter(currentChapter))

  const chapterControls = (
    <p aria-hidden>
      <CurrentChapterControl
        loadCount={loadCount}
        chapter={currentChapter}
        onChange={setCurrentChapter}
      />
    </p>
  )

  const [chooseNovelOpen, setChooseNovelOpen] = useState(false)
  const toggleChooseNovel = preventDefault(() => setChooseNovelOpen(!chooseNovelOpen))

  const changeNovelModal = chooseNovelOpen && (
    <ChooseNovelModal
      novelId={novelId}
      server={server}
      filter={filter}
      onClose={() => setChooseNovelOpen(false)}
      onChange={(server, novelId, filter) => {
        if (novelId) {
          setNovelId(novelId)
          setServer(server)
          setFilter(filter)
        }
      }}
    />
  )

  if (!novelId) {
    return (
      <>
        <RecentNovels recentNovels={recentNovels} onRemove={removeRecent} />
        {changeNovelModal}
        <div className="center">
          <button onClick={toggleChooseNovel}>New novel</button>
        </div>
      </>
    )
  }

  return (
    <>
      {changeNovelModal}
      <main className="app">
        <div aria-hidden className="center">
          <h3>
            <a href="#/">Home</a>
          </h3>
          <h1>
            <a href="" onClick={toggleChooseNovel}>
              {novelName}
            </a>
          </h1>
          <LoadCountControl loadCount={loadCount} onChange={setLoadCount} />
        </div>
        {chapterControls}
        {newestChapter > currentChapter && (
          <p aria-hidden className="center">
            <a href="" onClick={resumeNewestChapter}>
              Resume {newestChapter}
            </a>{' '}
            <a href="" onClick={clearResume}>
              (reset)
            </a>
          </p>
        )}
        {maxChapter && maxChapter.value && (
          <p aria-hidden className="center">
            <span className="notice">
              Latest chapter is {maxChapter.value}, checked {prettyTime(maxChapter.checked)}
            </span>
          </p>
        )}
        {repeat(loadCount, index => {
          const chapter = currentChapter + index
          const setChapter = index > 0 ? () => setCurrentChapter(chapter) : undefined
          return (
            <Chapter
              key={chapter}
              chapter={chapter}
              setChapter={setChapter}
              lines={chapters[index]}
            />
          )
        })}
        {chapterControls}
        <div className="screenreader-only">End of content. Thanks for reading pal.</div>
        <div aria-hidden className="center">
          <button onClick={scrollToTop}>Scroll to the top</button>
        </div>
        <ScrollControl />
      </main>
    </>
  )
}
