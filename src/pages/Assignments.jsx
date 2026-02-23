import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Assignments() {
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    fetch('/data/assignments.json')
      .then(r => r.json())
      .then(data => setAssignments(data))
  }, [])

  return (
    <section>
      <h1>Assignments</h1>
      <p>Complete course assignments to practice your skills and demonstrate learning outcomes.</p>
      
      <div className="assignments-list">
        {assignments.map(assignment => (
          <div key={assignment.id} className="assignment-card">
            <h2>{assignment.title}</h2>
            {assignment.description && <p>{assignment.description}</p>}
            <Link to={`/assignments/${assignment.slug}`} className="btn">View Assignment</Link>
          </div>
        ))}
      </div>
    </section>
  )
}
