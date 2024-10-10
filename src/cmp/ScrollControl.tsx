import { JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import { useScroll, useThrottledFn } from '../lib/hooks'
import { classNames, notEmpty, qq, scrollToBottom, scrollToTop } from '../lib/util'
import { Icon } from './Icon'

type Action = { label: string } & (
  | { url: string }
  | { onClick(e: JSX.TargetedMouseEvent<HTMLButtonElement>): void }
)

const defaultActions: Action[] = [{ label: 'Home', url: '/' }]

const getCurrentChapter = () => {
  const chapters = qq<HTMLDivElement>('[data-chapter]')
  const currentChapter =
    chapters.find(chapter => {
      const chapterTop = chapter.offsetTop
      const chapterBottom = chapterTop + chapter.offsetHeight
      return window.scrollY >= chapterTop && window.scrollY < chapterBottom
    }) ?? chapters[0]
  return currentChapter?.dataset.chapter
}

interface Props {
  moreActions?: (Action | null)[]
}

export function ScrollControl({ moreActions = [] }: Props) {
  const [scrollingDown, setScrollingDown] = useState(true)
  const [scrollPercentage, setScrollPercentage] = useState('0')

  const [currentChapter, setCurrentChapter] = useState(getCurrentChapter)

  const [showExtra, setShowExtra] = useState(false)

  const updateCurrentChapter = useThrottledFn(300, () => setCurrentChapter(getCurrentChapter()))

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
    updateCurrentChapter()
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

  const actions = [...moreActions.filter(notEmpty), ...defaultActions]

  return (
    <div
      aria-hidden
      className={classNames('scroll-control', showExtra && 'scroll-control--extra-visible')}
    >
      <div
        className={classNames(
          'scroll-control__extra',
          showExtra && 'scroll-control__extra--visible'
        )}
      >
        {currentChapter && <span className="notice">On chapter {currentChapter}</span>}
        {actions.map(link => (
          <button
            key={link.label}
            className="scroll-control__button"
            onClick={e => {
              console.log(e)
              if ('url' in link) location.hash = link.url
              else link.onClick(e)
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
        <Icon invert name={scrollingDown ? 'arrowDown' : 'arrowUp'} /> {scrollPercentage}
      </button>
    </div>
  )
}
