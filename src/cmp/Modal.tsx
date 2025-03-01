import { createEffect, JSXElement, onCleanup, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { trapFocus } from '@/lib/hooks'

interface Props {
  open: boolean
  onClose(): void
  content: JSXElement
  header?: JSXElement
  footer?: JSXElement
}

export function Modal(props: Props) {
  createEffect(() => {
    if (!props.open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown))
  })

  return (
    <Show when={props.open}>
      <Portal>
        <div
          ref={elem => trapFocus(elem, () => props.open)}
          class="modal"
          onClick={e => {
            if (e.target.className === 'modal') props.onClose()
          }}
        >
          <div class="modal__dialog">
            <Show when={props.header}>
              <div class="modal__header">{props.header}</div>
            </Show>
            <div class="modal__content">{props.content}</div>
            <Show when={props.footer}>
              <div class="modal__footer">{props.footer}</div>
            </Show>
          </div>
        </div>
      </Portal>
    </Show>
  )
}
