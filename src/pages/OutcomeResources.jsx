import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ResourceItem from '../components/ResourceItem'

export default function OutcomeResources() {
  const { id } = useParams()
  const loId = Number(id)
  const [outcomes, setOutcomes] = useState([])
  const [resources, setResources] = useState([])

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/learningOutcomes.json`).then(r => r.json()),
      fetch(`${import.meta.env.BASE_URL}data/resources.json`).then(r => r.json())
    ]).then(([los, res]) => {
      setOutcomes(los)
      setResources(res)
    })
  }, [])

  const loMap = useMemo(() => Object.fromEntries(outcomes.map(o => [o.id, o])), [outcomes])
  const filtered = useMemo(() => resources.filter(r => (r.learningOutcomes||[]).includes(loId)), [resources, loId])
  const lo = loMap[loId]

  return (
    <section>
      <h1>LO {loId}: {lo?.title || ''}</h1>
      {lo?.outcome && <p className="muted">{lo.outcome}</p>}
      <p><Link to="/learning-outcomes">← Back to all outcomes</Link></p>
      <ul className="resources">
        {filtered.map(r => (
          <ResourceItem key={r.id} resource={r} loMap={loMap} />
        ))}
      </ul>
    </section>
  )
}
