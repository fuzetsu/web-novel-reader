interface Props {
  loadCount: number
  onChange(loadCount: number): void
}

const MAX_LOAD_COUNT = 20

export function LoadCountControl({ loadCount, onChange }: Props) {
  return (
    <div>
      Load <button onClick={() => onChange(Math.max(1, loadCount - 1))}>-</button> {loadCount}{' '}
      <button onClick={() => onChange(Math.min(loadCount + 1, MAX_LOAD_COUNT))}>+</button>{' '}
      {loadCount === 1 ? 'chapter' : 'chapters'}
    </div>
  )
}
