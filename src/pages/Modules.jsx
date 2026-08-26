import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Modules() {
  const [modules, setModules] = useState([])
  useEffect(() => {
    fetch('/data/modules.json').then(r => r.json()).then(setModules)
  }, [])

  const sections = modules.reduce((groups, module) => {
    const name = module.section || 'Course Modules'
    if (!groups[name]) groups[name] = []
    groups[name].push(module)
    return groups
  }, {})

  return (
    <section>
      <header className="page-header"><span className="eyebrow">COURSE MAP / 14 WEEKS</span><h1>Modules<span className="pixel-dot">.</span></h1><p className="lead">A guided path through the histories, communities, consequences, and possible futures of video games.</p></header>
      {Object.entries(sections).map(([section, sectionModules], sectionIndex) => (
        <section className="module-section" key={section}>
          <header className="module-section-header"><span>{String(sectionIndex + 1).padStart(2, '0')}</span><div><div className="post-meta">SECTION</div><h2>{section}</h2></div><span className="week-range">WEEKS {sectionModules[0].week}–{sectionModules.at(-1).week}</span></header>
          <ul className="module-list">
            {sectionModules.map(m => (
              <li key={m.slug} className="module-card">
                <span className="module-week">WEEK {String(m.week).padStart(2, '0')}</span>
                <h3><Link to={`/modules/${m.slug}`}>{m.title}</Link></h3>
                {m.overview ? <p>{m.overview}</p> : <p className="muted">Overview coming soon.</p>}
                <Link className="module-link" to={`/modules/${m.slug}`}>Open module →</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  )
}
