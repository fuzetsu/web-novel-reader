interface Props {
  chapter: number
  setChapter(): void
  lines?: string[]
}

export function Chapter({ chapter, lines, setChapter }: Props) {
  if (!lines) return <h3>Loading chapter {chapter}</h3>

  return (
    <div className="chapter" data-chapter={chapter}>
      <p data-pos={`${chapter}-0`}>
        <span className="huge">Chapter {chapter} </span>
        <a
          className="small"
          href=""
          onClick={e => {
            e.preventDefault()
            setChapter()
          }}
        >
          Set chapter
        </a>
      </p>
      {lines.map((line, index) => (
        <p key={index} data-pos={`${chapter}-${index + 1}`}>
          {line}
        </p>
      ))}
    </div>
  )
}
