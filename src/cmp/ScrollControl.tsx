import { useRef, useState } from 'preact/hooks'
import { useScroll } from '../lib/hooks'
import { classNames, qq, scrollToBottom, scrollToTop } from '../lib/util'

type Link = { label: string } & ({ url: string } | { onClick(): void })

const extraLinks: Link[] = [{ label: 'Home', url: '/' }]

export function ScrollControl() {
  const [scrollingDown, setScrollingDown] = useState(true)
  const [scrollPercentage, setScrollPercentage] = useState('0')

  const [showExtra, setShowExtra] = useState(false)

  const lastScroll = useRef(0)
  useScroll(() => {
    const scrollElem = document.scrollingElement
    if (scrollElem) {
      const { scrollHeight, scrollTop } = scrollElem
      const curScroll = scrollTop + window.innerHeight
      setScrollPercentage(((curScroll / scrollHeight) * 100).toFixed(0))
      setScrollingDown(
        (curScroll > lastScroll.current && curScroll < scrollHeight) || scrollTop === 0
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
        .findIndex(chapter => chapter.getBoundingClientRect().top < -10)
      const nextChapter: Element | undefined = chapters[nextIndex]
      if (!nextChapter || nextIndex + 1 - chapters.length === 0) scrollToTop()
      else nextChapter.scrollIntoView()
    }
  }

  return (
    <div aria-hidden className="scroll-control">
      <div
        className={classNames(
          'scroll-control__extra',
          showExtra && 'scroll-control__extra--visible'
        )}
      >
        {extraLinks.map(link => (
          <button
            className="scroll-control__button"
            onClick={() => {
              if ('url' in link) location.hash = link.url
              else link.onClick()
            }}
          >
            {link.label}
          </button>
        ))}
      </div>
      <button
        className={classNames(
          'scroll-control__show-extra',
          showExtra && 'scroll-control__show-extra--upside-down'
        )}
        onClick={() => setShowExtra(!showExtra)}
      >
        {'\u2303'}
      </button>
      <button className="scroll-control__button" onClick={scrollToNextChapter}>
        {scrollingDown ? '\u25bc' : '\u25b2'} {scrollPercentage}
      </button>
    </div>
  )
}
