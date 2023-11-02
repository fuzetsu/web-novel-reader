import { ChooseNovelModal } from 'cmp/ChooseNovelModal'
import { RecentNovels } from 'cmp/RecentNovels'
import { preventDefault, repeat, scrollToTop } from 'lib/util'
import { useState } from 'preact/hooks'
import { Chapter } from '../Chapter'
import { CurrentChapterControl } from '../CurrentChapterControl'
import { ScrollControl } from '../ScrollControl'
import { useNovelState } from './hooks'
import { Nav } from 'cmp/Nav'

export function App() {
  const {
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
    setCurrentChapter,
    setFilter,
    setLoadCount,
    setNewestChapter,
    setNovelId,
    setNovelText,
    setNovelType,
    setServer
  } = useNovelState()

  const resumeNewestChapter = preventDefault(() => setCurrentChapter(newestChapter))
  const clearResume = preventDefault(() => setNewestChapter(currentChapter))

  const chapterControls = (
    <p aria-hidden>
      <CurrentChapterControl
        loadCount={loadCount}
        chapter={currentChapter}
        onChange={(chapter, loadCount) => {
          setCurrentChapter(chapter)
          setLoadCount(loadCount)
        }}
        maxChapter={novelType === 'text' ? maxChapter?.value : null}
      />
    </p>
  )

  const [chooseNovelOpen, setChooseNovelOpen] = useState(false)
  const toggleChooseNovel = preventDefault(() => setChooseNovelOpen(!chooseNovelOpen))

  const changeNovelModal = chooseNovelOpen && (
    <ChooseNovelModal
      state={
        novelType === 'text'
          ? { type: 'text', novelId, novelText }
          : { type: 'server', filter, novelId, server }
      }
      onClose={() => setChooseNovelOpen(false)}
      onChange={async nextState => {
        if (!nextState.novelId) return
        if (nextState.novelId !== novelId) {
          setNovelId(nextState.novelId)
          // hack: wait a frame after setting new novel ID to store subsequent state in correct localStorage key
          await new Promise(requestAnimationFrame)
        }
        setNovelType(nextState.type)
        if (nextState.type === 'server') {
          setServer(nextState.server)
          setFilter(nextState.filter)
        } else {
          setNovelText(nextState.novelText)
        }
      }}
    />
  )

  if (!novelId) {
    return (
      <div className="app">
        <Nav title="Recent novels">
          <button onClick={toggleChooseNovel}>New novel</button>
        </Nav>
        <RecentNovels recentNovels={recentNovels} onRemove={removeRecent} />
        {changeNovelModal}
      </div>
    )
  }

  return (
    <>
      {changeNovelModal}
      <main className="app">
        <Nav title={novelName || novelId}>
          <a href="#/" className="button">
            Novels
          </a>
          <button onClick={toggleChooseNovel}>Manage</button>
        </Nav>
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
              {novelType === 'server' ? (
                <>
                  Latest chapter is {maxChapter.value},{' '}
                  <a onClick={preventDefault(checkMaxChapter)}>check again</a>
                </>
              ) : (
                <>{maxChapter.value} chapters</>
              )}
            </span>
          </p>
        )}
        {repeat(loadCount, index => {
          const chapter = currentChapter + index
          const setChapter = index > 0 ? () => setCurrentChapter(chapter) : undefined
          const chapterLines = chapters[index]
          if (novelType === 'text' && !chapterLines) return null
          return (
            <Chapter key={chapter} chapter={chapter} setChapter={setChapter} lines={chapterLines} />
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
