import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section>
      <h1>INT/AME 264</h1>
      <p className="lead">The History and Culture of Video Games</p>
      <p>
        Explore the course through a retro-themed site built from structured JSON.
        Browse learning outcomes and weekly modules, and dive into curated resources.
      </p>
      <div className="cta-row">
        <Link className="btn" to="/learning-outcomes">Learning Outcomes</Link>
        <Link className="btn" to="/modules">Modules</Link>
      </div>
    </section>
  )
}
