import { Index, Show } from 'solid-js'

interface Props {
  chapter: number
  setChapter?(): void
  lines?: string[]
}

export function Chapter(props: Props) {
  return (
    <div class="chapter" data-chapter={props.chapter}>
      <p data-pos={`${props.chapter}-0`}>
        <span class="text-huge">Chapter {props.chapter} </span>
        <Show when={props.setChapter}>
          <a
            aria-hidden
            class="text-small no-wrap"
            href=""
            onClick={e => {
              e.preventDefault()
              props.setChapter?.()
            }}
          >
            Set chapter
          </a>
        </Show>
      </p>
      <Index each={props.lines} fallback={<p>Loading...</p>}>
        {(line, index) => (
          <p data-pos={`${props.chapter}-${index + 1}`}>{line()}</p>
        )}
      </Index>
    </div>
  )
}
