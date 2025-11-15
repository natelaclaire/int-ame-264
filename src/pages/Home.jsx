import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section>
      <h1>INT/AME 264</h1>
      <p className="lead">The History and Culture of Video Games</p>
      <p>
        This course explores the evolution of video games, their cultural and societal impact, and their role beyond entertainment. Students will analyze key milestones, ethical concerns, and technological advancements while examining gaming's influence on identity, education, and industry trends. The course includes historical studies, critical discussions, and hands-on engagement with gaming culture.
      </p>
      <div className="cta-row">
        <Link className="btn" to="/learning-outcomes">Learning Outcomes</Link>
        <Link className="btn" to="/modules">Modules</Link>
      </div>
    </section>
  )
}
