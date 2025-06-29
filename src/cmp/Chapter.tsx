import { usePreventDefault } from '@/lib/util'
import { Index, Show } from 'solid-js'
import { isErrorChapter } from './App/hooks'

interface Props {
  chapter: number
  setChapter?(): void
  lines?: string[]
  onRetry?(): void
}

export function Chapter(props: Props) {
  const setChapter = usePreventDefault(() => props.setChapter?.())
  const onRetry = usePreventDefault(() => props.onRetry?.())

  const isError = () => isErrorChapter(props.lines ?? [])

  return (
    <div class="chapter" data-chapter={props.chapter}>
      <p data-pos={`${props.chapter}-0`}>
        <span class="text-huge">Chapter {props.chapter} </span>
        <span class="chapter__actions">
          <Show when={props.setChapter}>
            <a
              aria-hidden
              class="text-small no-wrap"
              href=""
              onClick={setChapter}
            >
              Set chapter
            </a>
          </Show>
          <Show when={isError()}>
            <a aria-hidden class="text-small no-wrap" href="" onClick={onRetry}>
              Retry
            </a>
          </Show>
        </span>
      </p>
      <Index each={props.lines} fallback={<p>Loading...</p>}>
        {(line, index) => (
          <p data-pos={`${props.chapter}-${index + 1}`}>{line()}</p>
        )}
      </Index>
    </div>
  )
}
