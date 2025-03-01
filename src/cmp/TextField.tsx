import { autoFocus } from '@/lib/hooks'
import { Show } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'

interface Props<Rows extends number | undefined> {
  value: string
  placeholder?: string
  rows?: Rows
  disabled?: boolean
  onInput(value: string): void
  showTextControls?: boolean
  autoFocus?: boolean
}

export const DISABLE_AUTO_INPUT_PROPS = {
  autoComplete: 'off',
  autoCapitalize: 'off',
  autoCorrect: 'off',
} as const

export function TextField<T extends number | undefined>(props: Props<T>) {
  const inputProps = () =>
    ({
      ...DISABLE_AUTO_INPUT_PROPS,
      value: props.value,
      disabled: props.disabled,
      placeholder: props.placeholder,
      onInput: (e: InputEvent) =>
        props.onInput((e.target as HTMLInputElement | null)?.value ?? ''),
    }) satisfies JSX.HTMLElementTags['input' | 'textarea']

  const findTextarea = (elem: EventTarget | null) =>
    (elem as HTMLElement | undefined)
      ?.closest('.text-area')
      ?.querySelector('textarea')

  const setTextAreaCursor = (
    target: EventTarget | null,
    pos: 'top' | 'bottom',
  ) => {
    const txt = findTextarea(target)
    if (!txt) return
    const { cursor, scroll } =
      pos === 'top'
        ? { cursor: 0, scroll: 0 }
        : { cursor: props.value.length, scroll: txt.scrollHeight }
    txt.focus()
    txt.setSelectionRange(cursor, cursor)
    txt.scrollTop = scroll
  }

  const clearInput = (target: EventTarget | null) => {
    const txt = findTextarea(target)
    if (!txt) return
    txt.value = ''
    txt.focus()
  }

  const setupAutoFocus = (elem: HTMLElement) =>
    autoFocus(elem, () => props.autoFocus === true)

  return (
    <Show
      when={props.rows != null}
      fallback={<input ref={setupAutoFocus} {...inputProps()} />}
    >
      <div class="text-area">
        <textarea ref={setupAutoFocus} {...inputProps()} rows={props.rows} />
        <Show when={props.showTextControls}>
          <div class="button-group text-small">
            <button onClick={e => setTextAreaCursor(e.target, 'top')}>
              Prepend
            </button>
            <button onClick={e => setTextAreaCursor(e.target, 'bottom')}>
              Append
            </button>
            <button onClick={e => clearInput(e.target)}>Clear</button>
          </div>
        </Show>
      </div>
    </Show>
  )
}
