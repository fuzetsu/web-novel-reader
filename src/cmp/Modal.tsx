import { JSXElement, Show } from 'solid-js'
import { Portal } from 'solid-js/web'

interface Props {
  open: boolean
  onClose?(): void
  content: JSXElement
  header?: JSXElement
  footer?: JSXElement
}

export function Modal(props: Props) {
  if (!open) return null

  return (
    <Show when={props.open}>
      <Portal>
        <div
          class="modal"
          onClick={e =>
            (e.target as HTMLDivElement | undefined)?.className === 'modal'
              ? props.onClose?.()
              : null
          }
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
