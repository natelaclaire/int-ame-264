import { Link } from 'react-router-dom'
import posts from '../../data/writings.json'

export default function Writings() {
  const [featured, ...rest] = posts
  return <section>
    <header className="page-header"><span className="eyebrow">FIELD NOTES / ESSAYS / CONVERSATIONS</span><h1>Writings<span className="pixel-dot">.</span></h1><p className="lead">Thinking in public about games, technology, teaching, and the people who make play meaningful.</p></header>
    <Link to={`/writings/${featured.slug}`} className="post-feature">
      <div className="post-feature-art"><span>NEW<br/>SAVE</span></div>
      <div><div className="post-meta">{featured.category} · {featured.readTime}</div><h2>{featured.title}</h2><p>{featured.excerpt}</p><div className="byline">By {featured.author} <span>{featured.date}</span></div></div>
    </Link>
    <div className="section-rule"><span>MORE FROM THE ARCHIVE</span></div>
    <div className="post-list">{rest.map((post, i) => <Link to={`/writings/${post.slug}`} className="post-row" key={post.slug}><span className="post-number">{String(i + 2).padStart(2,'0')}</span><div><div className="post-meta">{post.category} · {post.readTime}</div><h2>{post.title}</h2><p>{post.excerpt}</p></div><div className="post-author">{post.author}<span>{post.date}</span></div><span className="card-arrow">↗</span></Link>)}</div>
  </section>
}
