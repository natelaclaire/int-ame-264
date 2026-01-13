import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ResourceItem from '../components/ResourceItem'

export default function Module() {
  const { slug } = useParams()
  const [modules, setModules] = useState([])
  const [resources, setResources] = useState([])
  const [outcomes, setOutcomes] = useState([])

  useEffect(() => {
    Promise.all([
      fetch('/data/modules.json').then(r => r.json()),
      fetch('/data/resources.json').then(r => r.json()),
      fetch('/data/learningOutcomes.json').then(r => r.json())
    ]).then(([mods, res, los]) => {
      setModules(mods)
      setResources(res)
      setOutcomes(los)
    })
  }, [])

  const module = useMemo(() => modules.find(m => m.slug === slug), [modules, slug])
  const loMap = useMemo(() => Object.fromEntries(outcomes.map(o => [o.id, o])), [outcomes])
  const resourcesForModule = useMemo(() => resources.filter(r => r.moduleSlug === slug), [resources, slug])
  const required = resourcesForModule.filter(r => r.required)
  const optional = resourcesForModule.filter(r => !r.required)

  if (!module) return <p className="muted">Loading module…</p>

  return (
    <section>
      <h1>Week {module.week}: {module.title}</h1>
      <p>{module.overview || <span className="muted">Overview coming soon.</span>}</p>
      <p><Link to="/modules" className="btn">← Back to all modules</Link></p>

      <h2>Required</h2>
      <ul className="resources">
        {required.map(r => (
          <ResourceItem key={r.id} resource={r} loMap={loMap} />
        ))}
      </ul>

      <h2>Optional</h2>
      <ul className="resources">
        {optional.map(r => (
          <ResourceItem key={r.id} resource={r} loMap={loMap} />
        ))}
      </ul>
    </section>
  )
}
