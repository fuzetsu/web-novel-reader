import { VNode } from 'preact'

interface Props {
  open: boolean
  onClose?(): void
  content: VNode
  header?: VNode
  footer?: VNode
}

export function Modal({ open, onClose, content, header, footer }: Props) {
  if (!open) return null

  return (
    <div
      className="modal"
      onClick={e =>
        (e.target as HTMLDivElement | undefined)?.className === 'modal' ? onClose?.() : null
      }
    >
      <div className="modal__dialog">
        {header && <div className="modal__header">{header}</div>}
        <div className="modal__content">{content}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
