import { RefObject } from 'preact'
import { JSXInternal } from 'preact/src/jsx'

interface Props<Rows extends number | undefined> {
  fieldRef?: RefObject<Rows extends undefined ? HTMLInputElement : HTMLTextAreaElement>
  value: string
  placeholder?: string
  rows?: Rows
  disabled?: boolean
  onInput(value: string): void
  showTextControls?: boolean
}

export const DISABLE_AUTO_INPUT_PROPS = {
  autoComplete: 'off',
  autoCapitalize: 'off',
  autoCorrect: 'off'
} as const

export function TextField<T extends number | undefined>({
  onInput,
  value,
  rows,
  showTextControls,
  fieldRef,
  ...rest
}: Props<T>) {
  const props = {
    ...DISABLE_AUTO_INPUT_PROPS,
    ...rest,
    value,
    onInput: e => onInput((e.target as HTMLInputElement | null)?.value ?? '')
  } satisfies JSXInternal.HTMLAttributes<HTMLInputElement | HTMLTextAreaElement>

  if (rows == null) {
    return <input ref={fieldRef as RefObject<HTMLInputElement>} {...props} />
  }

  const setTextAreaCursor = (target: EventTarget | null, pos: 'top' | 'bottom') => {
    if (!target) return
    const elem = target as HTMLElement
    const txt = elem.closest('.text-area')?.querySelector('textarea')
    if (!txt) return
    const { cursor, scroll } =
      pos === 'top' ? { cursor: 0, scroll: 0 } : { cursor: value.length, scroll: txt.scrollHeight }
    txt.focus()
    txt.setSelectionRange(cursor, cursor)
    txt.scrollTop = scroll
  }
  return (
    <div className="text-area">
      <textarea {...props} ref={fieldRef as RefObject<HTMLTextAreaElement>} rows={rows} />
      {showTextControls && (
        <div className="button-group small">
          <button
            onClick={e => {
              setTextAreaCursor(e.target, 'top')
            }}
          >
            Prepend
          </button>
          <button onClick={e => setTextAreaCursor(e.target, 'bottom')}>Append</button>
        </div>
      )}
    </div>
  )
}
