import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ResourceItem from '../components/ResourceItem'

export default function OutcomeResources() {
  const { id } = useParams()
  const loId = Number(id)
  const [outcomes, setOutcomes] = useState([])
  const [resources, setResources] = useState([])
  const [modules, setModules] = useState([])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    Promise.all([
      fetch('/data/learningOutcomes.json').then(r => r.json()),
      fetch('/data/resources.json').then(r => r.json()),
      fetch('/data/modules.json').then(r => r.json())
    ]).then(([los, res, mods]) => {
      setOutcomes(los)
      setResources(res)
      setModules(mods)
    })
  }, [])

  const loMap = useMemo(() => Object.fromEntries(outcomes.map(o => [o.id, o])), [outcomes])
  const filtered = useMemo(() => resources.filter(r => (r.learningOutcomes||[]).includes(loId)), [resources, loId])
  const moduleMap = useMemo(() => Object.fromEntries(modules.map(m => [m.slug, m])), [modules])
  const lo = loMap[loId]

  return (
    <section>
      <h1>LO {loId}: {lo?.title || ''}</h1>
      {lo?.outcome && <p className="muted">{lo.outcome}</p>}
      <p><Link to="/learning-outcomes" className="btn">← Back to all outcomes</Link></p>
      <ul className="resources">
        {filtered.map(r => (
          <ResourceItem key={r.id} resource={r} loMap={loMap} showModuleMeta moduleMap={moduleMap} />
        ))}
      </ul>
    </section>
  )
}
