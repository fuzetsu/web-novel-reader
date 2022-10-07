interface Props {
  chapter: number
  setChapter?(): void
  lines?: string[]
}

export function Chapter({ chapter, lines, setChapter }: Props) {
  if (!lines) lines = [`Loading...`]

  return (
    <div className="chapter" data-chapter={chapter}>
      <p data-pos={`${chapter}-0`}>
        <span className="huge">Chapter {chapter} </span>
        {setChapter && (
          <a
            aria-hidden
            className="small no-wrap"
            href=""
            onClick={e => {
              e.preventDefault()
              setChapter()
            }}
          >
            Set chapter
          </a>
        )}
      </p>
      {lines.map((line, index) => (
        <p key={index} data-pos={`${chapter}-${index + 1}`}>
          {line}
        </p>
      ))}
    </div>
  )
}
