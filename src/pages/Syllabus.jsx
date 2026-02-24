import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export default function Syllabus() {
  const { slug } = useParams()
  const [syllabi, setSyllabi] = useState([])
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/syllabi.json')
      .then(r => r.json())
      .then(data => setSyllabi(data))
  }, [])

  const syllabus = useMemo(() => syllabi.find(s => s.slug === slug), [syllabi, slug])

  useEffect(() => {
    if (!syllabus) return

    fetch(`/data/syllabi/${syllabus.markdown}`)
      .then(r => r.text())
      .then(data => {
        setMarkdown(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [syllabus])

  if (!syllabus) {
    return <p className="muted">Loading syllabus…</p>
  }

  if (loading) {
    return <p className="muted">Loading…</p>
  }

  // Simple markdown to HTML converter
  const renderMarkdown = (md) => {
    const convertTables = (input) => {
      const lines = input.split('\n')
      const out = []
      let i = 0

      const isTableDivider = (line) => /^\s*\|?\s*[-:]+(?:\s*\|\s*[-:]+)+\s*\|?\s*$/.test(line)
      const isTableRow = (line) => /^\s*\|?.+\|.+\|?\s*$/.test(line)

      while (i < lines.length) {
        if (isTableRow(lines[i]) && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
          const header = lines[i].trim().replace(/^\|/, '').replace(/\|$/, '')
          const headers = header.split('|').map(cell => cell.trim())
          i += 2
          const rows = []
          while (i < lines.length && isTableRow(lines[i]) && lines[i].trim() !== '') {
            const row = lines[i].trim().replace(/^\|/, '').replace(/\|$/, '')
            rows.push(row.split('|').map(cell => cell.trim()))
            i += 1
          }

          const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`
          const tbody = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`
          out.push(`<table>${thead}${tbody}</table>`)
          continue
        }

        out.push(lines[i])
        i += 1
      }

      return out.join('\n')
    }

    let html = convertTables(md)

    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>')

    // Horizontal rules
    html = html.replace(/^-{3,}$/gm, '<hr>')

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
    html = html.replace(/_(.+?)_/g, '<em>$1</em>')

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')

    // Lists
    html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*?<\/li>)(\n<li>.*?<\/li>)*/g, '<ul>$&</ul>')

    // Line breaks and paragraphs
    html = html.replace(/\n\n+/g, '</p><p>')
    html = html.replace(/^(?!<)(.+)$/gm, (match) => {
      if (match.match(/^</) || match.trim() === '') return match
      return match
    })

    // Wrap in paragraphs
    html = '<p>' + html + '</p>'

    // Code blocks
    html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')

    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>')

    return html
  }

  return (
    <section>
      <Link to="/syllabi" className="btn">← Back to syllabi</Link>

      <h1>{syllabus.term}</h1>
      <p className="muted">{syllabus.startDate} – {syllabus.endDate}</p>

      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
      />
    </section>
  )
}
