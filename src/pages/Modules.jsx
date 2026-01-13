import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Modules() {
  const [modules, setModules] = useState([])
  useEffect(() => {
    fetch('/data/modules.json').then(r => r.json()).then(setModules)
  }, [])

  return (
    <section>
      <h1>Modules</h1>
      <ul className="module-list">
        {modules.map(m => (
          <li key={m.slug} className="module-card">
            <h3>
              <Link to={`/modules/${m.slug}`}>Week {m.week}: {m.title}</Link>
            </h3>
            {m.overview ? <p>{m.overview}</p> : <p className="muted">Overview coming soon.</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
