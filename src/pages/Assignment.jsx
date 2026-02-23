import { useEffect, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

export default function Assignment() {
  const { slug, supplemental } = useParams()
  const [assignments, setAssignments] = useState([])
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/assignments.json')
      .then(r => r.json())
      .then(data => setAssignments(data))
  }, [])

  const assignment = useMemo(() => {
    return assignments.find(a => a.slug === slug)
  }, [assignments, slug])

  const currentContent = useMemo(() => {
    if (!assignment) return null
    
    if (supplemental) {
      // Find supplemental content
      const supp = assignment.supplemental.find(s => s.slug === supplemental)
      return supp ? { ...supp, isSupplemental: true } : null
    }
    
    return { markdown: assignment.markdown, isSupplemental: false }
  }, [assignment, supplemental])

  useEffect(() => {
    if (!currentContent) return

    const markdownFile = currentContent.markdown
    fetch(`/data/assignments/${markdownFile}`)
      .then(r => r.text())
      .then(data => {
        // Convert markdown internal links to app links
        // Transforms [Text](file.md) to [Text](/assignments/slug/supplemental/file-slug)
        let processed = data
        
        if (assignment && assignment.supplemental) {
          // Create a map for quick lookup
          const suppMap = Object.fromEntries(
            assignment.supplemental.map(s => [s.markdown, s.slug])
          )
          
          // Replace internal links
          processed = data.replace(
            /\[([^\]]+)\]\(([^)]+\.md)\)/g,
            (match, text, filename) => {
              const suppSlug = suppMap[filename]
              if (suppSlug) {
                return `[${text}](/assignments/${assignment.slug}/${suppSlug})`
              }
              return match
            }
          )
        }

        setMarkdown(processed)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading markdown:', err)
        setLoading(false)
      })
  }, [currentContent, assignment])

  if (!assignment) {
    return <p className="muted">Loading assignment…</p>
  }

  if (loading) {
    return <p className="muted">Loading…</p>
  }

  // Simple markdown to HTML converter
  const renderMarkdown = (md) => {
    let html = md

    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>')

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
    html = html.replace(/_(.+?)_/g, '<em>$1</em>')

    // Links (already converted to app routes)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')

    // Lists
    html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')

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
      <Link to="/assignments" className="btn">← Back to assignments</Link>

      <h1>{assignment.title}</h1>
      {assignment.description && <p className="subtitle">{assignment.description}</p>}

      {assignment.supplemental && assignment.supplemental.length > 0 && (
        <div className="supplemental-nav">
          <p><strong>Supplemental Materials:</strong></p>
          <ul className="supplemental-links">
            {assignment.supplemental.map(supp => (
              <li key={supp.slug}>
                <Link 
                  to={`/assignments/${assignment.slug}/${supp.slug}`}
                  className={supplemental === supp.slug ? 'active' : ''}
                >
                  {supp.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div 
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
      />
    </section>
  )
}
