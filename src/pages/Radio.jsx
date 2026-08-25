import { useState } from 'react'
import episodes from '../../data/radio.json'

export default function Radio() {
  const [open, setOpen] = useState(episodes[0]?.id)
  return <section>
    <header className="radio-hero"><div><span className="eyebrow">TRANSMITTING SOON</span><h1>Radio<span className="pixel-dot">.</span></h1><p className="lead">A show about the sound of games—the scores, scenes, and strange little noises that stay with us.</p></div><div className="radio-dial" aria-hidden="true"><span>FM</span><strong>26.4</strong><div className="dial-line"/></div></header>
    <div className="broadcast-bar"><span className="status-dot"/> PILOT SIGNAL</div>
    <div className="episode-list">{episodes.map((episode, index) => {
      const expanded = open === episode.id
      return <article className={`episode ${expanded ? 'expanded' : ''}`} key={episode.id}>
        <button className="episode-summary" onClick={() => setOpen(expanded ? null : episode.id)} aria-expanded={expanded}>
          <span className="episode-no">EP. {String(index + 1).padStart(2,'0')}</span><span><span className="post-meta">{episode.date} · {episode.duration}</span><strong>{episode.topic}</strong></span><span className="episode-toggle">{expanded ? '−' : '+'}</span>
        </button>
        {expanded && <div className="episode-content"><p className="episode-notes">{episode.notes}</p><div className="track-header"><span># / TRACK</span><span>GAME</span><span>NOTES</span></div>{episode.songs.map((song, i) => <div className="track" key={`${song.title}-${i}`}><span className="track-no">{String(i+1).padStart(2,'0')}</span><div><strong>{song.title}</strong><span>{song.artist}</span></div><div><strong>{song.game}</strong></div><p>{song.notes}</p></div>)}</div>}
      </article>})}</div>
  </section>
}
