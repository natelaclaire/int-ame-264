import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Syllabi() {
  const [syllabi, setSyllabi] = useState([])

  useEffect(() => {
    fetch('/data/syllabi.json')
      .then(r => r.json())
      .then(data => setSyllabi(data))
  }, [])

  return (
    <section>
      <h1>Syllabi</h1>
      <p>Course syllabi by term.</p>

      <div className="assignments-list">
        {syllabi.map(syllabus => (
          <div key={syllabus.id} className="assignment-card">
            <h2>{syllabus.term}</h2>
            <p className="muted">{syllabus.startDate} – {syllabus.endDate}</p>
            <Link to={`/syllabi/${syllabus.slug}`} className="btn">View Syllabus</Link>
          </div>
        ))}
      </div>
    </section>
  )
}
