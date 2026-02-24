import { Link } from 'react-router-dom'
import heroImage from '../assets/gaming-history-image.png'

export default function Home() {
  return (
    <section className="home-hero">
      <div className="home-text">
        <h1>INT/AME 264</h1>
        <p className="lead">The History and Culture of Video Games</p>
        <p>
          This course explores the evolution of video games, their cultural and societal impact, and their role beyond entertainment. Students will analyze key milestones, ethical concerns, and technological advancements while examining gaming's influence on identity, education, and industry trends. The course includes historical studies, critical discussions, and hands-on engagement with gaming culture.
        </p>
        <div className="cta-row">
          <Link className="btn" to="/learning-outcomes">Learning Outcomes</Link>
          <Link className="btn" to="/modules">Modules</Link>
        </div>
      </div>
      <div className="home-image">
        <img src={heroImage} alt="Retro game controller and pixel art scene" />
      </div>
    </section>
  )
}
