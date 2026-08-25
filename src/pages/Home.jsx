import { Link } from 'react-router-dom'
import heroImage from '../assets/gaming-history-image.png'

export default function Home() {
  return (
    <>
    <section className="home-hero">
      <div className="home-text stagger">
        <div className="eyebrow"><span>COURSE FILE</span><span>FALL 2026</span></div>
        <h1>VIDEO GAMES<br/><em>ARE CULTURE.</em></h1>
        <p className="lead">The History &amp; Culture of Video Gaming</p>
        <p>
          This course explores the evolution of video games, their cultural and societal impact, and their role beyond entertainment. Students will analyze key milestones, ethical concerns, and technological advancements while examining gaming's influence on identity, education, and industry trends. The course includes historical studies, critical discussions, and hands-on engagement with gaming culture.
        </p>
        <div className="cta-row">
          <Link className="btn" to="/modules">Enter the course <span>→</span></Link>
          <Link className="btn btn-ghost" to="/writings">Read the latest</Link>
        </div>
      </div>
      <div className="home-image">
        <img src={heroImage} alt="Retro game controller and pixel art scene" />
        <div className="image-caption"><span>ARCHIVE_001</span><span>PLAY / STUDY / QUESTION</span></div>
      </div>
    </section>
    <section className="home-grid">
      <Link to="/modules" className="feature-card feature-card-wide">
        <span className="card-index">01</span><div><span className="kicker">Course</span><h2>Fourteen weeks.<br/>One playable history.</h2><p>Move from arcades to AI through readings, games, debate, and cultural analysis.</p></div><span className="card-arrow">↗</span>
      </Link>
      <Link to="/writings" className="feature-card coral">
        <span className="card-index">02</span><div><span className="kicker">Writings</span><h2>Notes from the edge of play.</h2></div><span className="card-arrow">↗</span>
      </Link>
      <Link to="/radio" className="feature-card dark-card">
        <span className="card-index">03</span><div><span className="kicker">Radio</span><h2>Games worth hearing.</h2><div className="waveform" aria-hidden="true">▂▆▃█▅▂▇▄▁▆▃█▂▅▇▃</div></div><span className="card-arrow">↗</span>
      </Link>
    </section>
    </>
  )
}
