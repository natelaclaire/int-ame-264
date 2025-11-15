import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function LearningOutcomes() {
  const [outcomes, setOutcomes] = useState([])
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/learningOutcomes.json`).then(r => r.json()).then(setOutcomes)
  }, [])

  return (
    <section>
      <h1>Learning Outcomes</h1>
      <ul className="lo-list">
        {outcomes.map(lo => (
          <li key={lo.id} className="lo-card">
            <h3><Link to={`/outcomes/${lo.id}`}>LO {lo.id}: {lo.title}</Link></h3>
            {lo.outcome && <p>{lo.outcome}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
