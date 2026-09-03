import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import posts from '../../data/writings.json'

export default function Writing() {
  const { slug } = useParams()
  const post = posts.find(p => p.slug === slug)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!post) return
    setLoading(true)
    fetch(`/data/writings/${post.markdown}`)
      .then(response => {
        if (!response.ok) throw new Error('Writing could not be loaded.')
        return response.text()
      })
      .then(setBody)
      .catch(() => setBody('This writing could not be loaded.'))
      .finally(() => setLoading(false))
  }, [post])

  if (!post) return <section><h1>Post not found.</h1><Link className="btn" to="/writings">Back to writings</Link></section>
  return <article className="article-page"><Link className="text-link" to="/writings">← All writings</Link><header><div className="post-meta">{post.category} · {post.readTime}</div><h1>{post.title}</h1><div className="article-byline">Written by <strong>{post.author}</strong> · {post.date}</div></header>{loading ? <p className="muted">Loading…</p> : <div className="writing-body"><ReactMarkdown>{body}</ReactMarkdown></div>}</article>
}
