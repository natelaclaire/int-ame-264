import { Link, useParams } from 'react-router-dom'
import posts from '../../data/writings.json'

export default function Writing() {
  const { slug } = useParams(); const post = posts.find(p => p.slug === slug)
  if (!post) return <section><h1>Post not found.</h1><Link className="btn" to="/writings">Back to writings</Link></section>
  return <article className="article-page"><Link className="text-link" to="/writings">← All writings</Link><header><div className="post-meta">{post.category} · {post.readTime}</div><h1>{post.title}</h1><div className="article-byline">Written by <strong>{post.author}</strong> · {post.date}</div></header>{post.body.map((paragraph, i) => i === 0 ? <p className="article-lead" key={i}>{paragraph}</p> : <p key={i}>{paragraph}</p>)}</article>
}
