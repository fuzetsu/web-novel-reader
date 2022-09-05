import { useRef, useState } from 'preact/hooks'
import { useScroll } from '../lib/hooks'
import { qq, scrollToBottom, scrollToTop } from '../lib/util'

export function ScrollControl() {
  const [scrollingDown, setScrollingDown] = useState(true)
  const lastScroll = useRef(0)
  useScroll(() => {
    const scrollElem = document.scrollingElement
    if (scrollElem) {
      const curScroll = scrollElem.scrollTop
      setScrollingDown(
        (curScroll > lastScroll.current &&
          curScroll < scrollElem.scrollHeight - window.innerHeight) ||
          curScroll === 0
      )
      lastScroll.current = curScroll
    }
  })

  const scrollToNextChapter = () => {
    const chapters = qq('[data-chapter]')
    if (scrollingDown) {
      const nextChapter = chapters.find(
        chapter => chapter.getBoundingClientRect().top - window.innerHeight > -10
      )
      if (nextChapter) nextChapter.scrollIntoView()
      else scrollToBottom()
    } else {
      const nextIndex = chapters
        .reverse()
        .findIndex(chapter => chapter.getBoundingClientRect().top < 0)
      const nextChapter: Element | undefined = chapters[nextIndex]
      if (!nextChapter || nextIndex + 1 - chapters.length === 0) scrollToTop()
      else nextChapter.scrollIntoView()
    }
  }

  return (
    <button aria-hidden className="next-chapter-action" onClick={scrollToNextChapter}>
      {scrollingDown ? '\u25bc' : '\u25b2'}
    </button>
  )
}
