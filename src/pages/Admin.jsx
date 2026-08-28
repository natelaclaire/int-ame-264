import { useEffect, useMemo, useState } from 'react'

const collections = [
  { key: 'learningOutcomes', label: 'Learning Outcomes', singular: 'Outcome' },
  { key: 'modules', label: 'Modules', singular: 'Module' },
  { key: 'resources', label: 'Resources', singular: 'Resource' },
  { key: 'assignments', label: 'Assignments', singular: 'Assignment' },
  { key: 'syllabi', label: 'Syllabi', singular: 'Syllabus' },
  { key: 'writings', label: 'Writings', singular: 'Post' },
  { key: 'radio', label: 'Radio', singular: 'Episode' },
  { key: 'assignmentDocs', label: 'Assignment Documents', singular: 'Document', documents: 'assignments' },
  { key: 'syllabusDocs', label: 'Syllabus Documents', singular: 'Document', documents: 'syllabi' }
]

const templates = {
  learningOutcomes: { id: 0, title: 'New learning outcome', outcome: '', indicators: '', slug: 'new-learning-outcome' },
  modules: { week: 0, title: 'New module', slug: 'new-module', topic: '', overview: '', section: 'Historical Foundations' },
  resources: { id: 'new-resource', moduleSlug: '', moduleWeek: 0, order: 1, title: 'New resource', url: '', type: 'Article', duration: '', notes: '', learningOutcomes: [], required: false, topic: 'General' },
  assignments: { id: 'new-assignment', title: 'New assignment', description: '', slug: 'new-assignment', markdown: '', supplemental: [] },
  syllabi: { id: 'new-syllabus', term: 'New term', startDate: '', endDate: '', slug: 'new-syllabus', markdown: '' },
  writings: { slug: 'new-post', title: 'New post', author: 'Nate LaClaire', date: '', category: 'Essay', readTime: '5 min read', excerpt: '', body: [''] },
  radio: { id: 'new-episode', date: '', duration: '', topic: 'New episode', notes: '', songs: [] }
}

const deepClone = value => JSON.parse(JSON.stringify(value))
const recordTitle = (record, index) => record?.title || record?.topic || record?.term || record?.id || `Item ${index + 1}`
const normalizeResourceOrder = items => {
  const weekCounts = new Map()
  return items.map(item => {
    const week = item.moduleSlug || `week-${item.moduleWeek || 0}`
    const nextOrder = (weekCounts.get(week) || 0) + 1
    weekCounts.set(week, Math.max(nextOrder, Number.isFinite(item.order) ? item.order : 0))
    return Number.isFinite(item.order) ? item : { ...item, order: nextOrder }
  })
}
const sortResourceCollection = items => {
  const weekCounts = new Map()
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => (a.item.moduleWeek || 0) - (b.item.moduleWeek || 0) || (a.item.order || 0) - (b.item.order || 0) || a.index - b.index)
    .map(({ item }) => {
      const week = item.moduleSlug || `week-${item.moduleWeek || 0}`
      const order = (weekCounts.get(week) || 0) + 1
      weekCounts.set(week, order)
      return { ...item, order }
    })
}
const blankArrayItem = (value, name) => {
  if (!value.length) return /learning outcomes/i.test(name) ? 0 : ''
  if (typeof value[0] === 'number') return 0
  if (typeof value[0] !== 'object') return ''
  return Object.fromEntries(Object.entries(value[0]).map(([key, child]) => [key, typeof child === 'boolean' ? false : typeof child === 'number' ? 0 : Array.isArray(child) ? [] : '']))
}

function Field({ name, value, onChange, depth = 0, outcomeOptions = [] }) {
  const label = name.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase())
  if (name === 'learningOutcomes' && Array.isArray(value) && outcomeOptions.length) {
    const toggleOutcome = (id, checked) => onChange(
      checked ? [...new Set([...value, id])].sort((a, b) => a - b) : value.filter(current => current !== id)
    )
    return <fieldset className="cms-nested cms-outcomes"><legend>{label}</legend><p className="cms-field-help">Choose every learning outcome connected to this resource.</p><div className="cms-outcome-options">{outcomeOptions.map(outcome => <label className="cms-outcome-option" key={outcome.id}><input type="checkbox" checked={value.includes(outcome.id)} onChange={event => toggleOutcome(outcome.id, event.target.checked)} /><span><strong>LO {outcome.id}: {outcome.title}</strong><small>{outcome.outcome}</small></span></label>)}</div></fieldset>
  }
  if (typeof value === 'boolean') return <label className="cms-check"><input type="checkbox" checked={value} onChange={event => onChange(event.target.checked)} /><span>{label}</span></label>
  if (typeof value === 'number') return <label className="cms-field"><span>{label}</span><input type="number" value={value} onChange={event => onChange(Number(event.target.value))} /></label>
  if (typeof value === 'string') {
    const multiline = /notes|overview|outcome|indicators|excerpt|description|content/i.test(name) || value.length > 100
    return <label className="cms-field"><span>{label}</span>{multiline ? <textarea rows={Math.min(10, Math.max(4, Math.ceil(value.length / 90)))} value={value} onChange={event => onChange(event.target.value)} /> : <input value={value} onChange={event => onChange(event.target.value)} />}</label>
  }
  if (Array.isArray(value)) return <fieldset className="cms-nested"><legend>{label}</legend>{value.map((item, index) => <div className="cms-array-item" key={index}><Field name={`${name} ${index + 1}`} value={item} depth={depth + 1} outcomeOptions={outcomeOptions} onChange={next => onChange(value.map((current, itemIndex) => itemIndex === index ? next : current))} /><button type="button" className="cms-icon-button danger" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${label} ${index + 1}`}>×</button></div>)}<button type="button" className="cms-small-button" onClick={() => onChange([...value, blankArrayItem(value, name)])}>+ Add {label.replace(/s$/, '')}</button></fieldset>
  if (value && typeof value === 'object') return <fieldset className="cms-nested"><legend>{label}</legend>{Object.entries(value).map(([key, child]) => <Field key={key} name={key} value={child} depth={depth + 1} outcomeOptions={outcomeOptions} onChange={next => onChange({ ...value, [key]: next })} />)}</fieldset>
  return null
}

function CollectionEditor({ config }) {
  const [items, setItems] = useState([])
  const [saved, setSaved] = useState([])
  const [selected, setSelected] = useState(0)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Loading…')
  const [outcomeOptions, setOutcomeOptions] = useState([])

  useEffect(() => {
    const requests = [fetch(`/__cms/data/${config.key}`).then(response => response.json())]
    if (config.key === 'resources') requests.push(fetch('/__cms/data/learningOutcomes').then(response => response.json()))
    Promise.all(requests).then(([data, outcomes = []]) => {
      const prepared = config.key === 'resources' ? normalizeResourceOrder(data) : data
      setOutcomeOptions(outcomes)
      setItems(prepared); setSaved(deepClone(prepared)); setSelected(0); setStatus('')
    }).catch(error => setStatus(error.message))
  }, [config.key])

  const dirty = JSON.stringify(items) !== JSON.stringify(saved)
  useEffect(() => {
    const warn = event => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const filtered = useMemo(() => items.map((item, index) => ({ item, index })).filter(({ item }) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [items, query])
  const current = items[selected]
  const updateCurrent = next => setItems(items.map((item, index) => index === selected ? next : item))

  const save = async () => {
    setStatus('Saving…')
    const prepared = config.key === 'resources' ? sortResourceCollection(items) : items
    const response = await fetch(`/__cms/data/${config.key}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prepared) })
    const result = await response.json()
    if (!response.ok) return setStatus(result.error || 'Save failed.')
    setItems(prepared); setSaved(deepClone(prepared)); setSelected(Math.max(0, prepared.findIndex(item => item.id === current?.id))); setStatus(`Saved ${result.count} records.`)
  }

  const add = () => { const next = [...items, deepClone(templates[config.key])]; setItems(next); setSelected(next.length - 1) }
  const remove = () => { if (!current || !window.confirm(`Delete “${recordTitle(current, selected)}”?`)) return; const next = items.filter((_, index) => index !== selected); setItems(next); setSelected(Math.max(0, selected - 1)) }
  const moveCurrent = direction => {
    if (!current || config.key !== 'resources') return
    const siblings = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.moduleSlug === current.moduleSlug)
      .sort((a, b) => a.item.order - b.item.order || a.index - b.index)
    const position = siblings.findIndex(({ index }) => index === selected)
    const target = siblings[position + direction]
    if (!target) return
    const currentOrder = current.order
    const next = items.map((item, index) => index === selected ? { ...item, order: target.item.order } : index === target.index ? { ...item, order: currentOrder } : item)
    setItems(next)
  }
  const resourcePosition = config.key === 'resources' && current ? items.filter(item => item.moduleSlug === current.moduleSlug).sort((a, b) => a.order - b.order).findIndex(item => item.id === current.id) : -1
  const resourceCount = config.key === 'resources' && current ? items.filter(item => item.moduleSlug === current.moduleSlug).length : 0

  return <div className="cms-workspace">
    <aside className="cms-records"><div className="cms-record-tools"><input type="search" placeholder={`Search ${config.label.toLowerCase()}…`} value={query} onChange={event => setQuery(event.target.value)} /><button type="button" onClick={add}>+ New</button></div><div className="cms-record-list">{filtered.map(({ item, index }) => <button type="button" className={index === selected ? 'active' : ''} onClick={() => setSelected(index)} key={`${recordTitle(item, index)}-${index}`}><span>{recordTitle(item, index)}</span><small>{item.week ? `Week ${item.week}` : item.type || item.category || item.date || ''}</small></button>)}</div></aside>
    <section className="cms-editor">{current ? <><header className="cms-editor-header"><div><div className="post-meta">EDIT {config.singular.toUpperCase()}</div><h2>{recordTitle(current, selected)}</h2></div><div className="cms-actions">{config.key === 'resources' && <><button type="button" disabled={resourcePosition <= 0} onClick={() => moveCurrent(-1)}>↑ Move up</button><button type="button" disabled={resourcePosition < 0 || resourcePosition >= resourceCount - 1} onClick={() => moveCurrent(1)}>↓ Move down</button></>}<button type="button" className="danger" onClick={remove}>Delete</button><button type="button" disabled={!dirty} onClick={save}>{dirty ? 'Save changes' : 'Saved'}</button></div></header><div className="cms-form">{Object.entries(current).map(([key, value]) => <Field key={key} name={key} value={value} outcomeOptions={outcomeOptions} onChange={next => updateCurrent({ ...current, [key]: next })} />)}</div></> : <div className="cms-empty">No records yet. Add the first one.</div>}<div className="cms-status" aria-live="polite">{status}{dirty && !status ? 'Unsaved changes' : ''}</div></section>
  </div>
}

function DocumentEditor({ config }) {
  const [files, setFiles] = useState([]); const [selected, setSelected] = useState(''); const [content, setContent] = useState(''); const [saved, setSaved] = useState(''); const [status, setStatus] = useState('Loading…')
  useEffect(() => { fetch(`/__cms/documents/${config.documents}`).then(r => r.json()).then(list => { setFiles(list); setSelected(list[0] || ''); setStatus('') }) }, [config.documents])
  useEffect(() => { if (!selected) return; fetch(`/__cms/document/${config.documents}/${encodeURIComponent(selected)}`).then(r => r.json()).then(doc => { setContent(doc.content); setSaved(doc.content) }) }, [config.documents, selected])
  const save = async () => { setStatus('Saving…'); const response = await fetch(`/__cms/document/${config.documents}/${encodeURIComponent(selected)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }); const result = await response.json(); if (response.ok) { setSaved(content); setStatus('Document saved.') } else setStatus(result.error || 'Save failed.') }
  useEffect(() => {
    const warn = event => { if (content !== saved) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [content, saved])
  return <div className="cms-workspace"><aside className="cms-records"><div className="cms-record-list">{files.map(file => <button type="button" className={file === selected ? 'active' : ''} onClick={() => setSelected(file)} key={file}>{file}</button>)}</div></aside><section className="cms-editor"><header className="cms-editor-header"><div><div className="post-meta">MARKDOWN DOCUMENT</div><h2>{selected}</h2></div><div className="cms-actions"><button type="button" disabled={content === saved} onClick={save}>{content === saved ? 'Saved' : 'Save document'}</button></div></header><textarea className="cms-markdown" value={content} onChange={event => setContent(event.target.value)} spellCheck="true" /><div className="cms-status">{status}{content !== saved && !status ? 'Unsaved changes' : ''}</div></section></div>
}

export default function Admin() {
  const [active, setActive] = useState(collections[0])
  const [epubStatus, setEpubStatus] = useState('')
  if (!import.meta.env.DEV) return <section className="page-header"><span className="eyebrow">LOCAL TOOL</span><h1>CMS unavailable<span className="pixel-dot">.</span></h1><p className="lead">The editor only runs on your local development server so production content cannot be changed accidentally.</p></section>
  const rebuildEpub = async () => { setEpubStatus('Building…'); const response = await fetch('/__cms/build-epub', { method: 'POST' }); const result = await response.json(); setEpubStatus(response.ok ? 'ePub rebuilt.' : result.error) }
  return <section className="cms-page"><header className="cms-header"><div><span className="eyebrow">LOCAL CONTENT STUDIO</span><h1>Course CMS<span className="pixel-dot">.</span></h1><p>Edit the source files directly. Changes appear on the site after saving.</p></div><div><button type="button" className="btn" onClick={rebuildEpub}>Rebuild ePub ↓</button><small>{epubStatus}</small></div></header><nav className="cms-tabs" aria-label="Content types">{collections.map(config => <button type="button" className={active.key === config.key ? 'active' : ''} onClick={() => setActive(config)} key={config.key}>{config.label}</button>)}</nav>{active.documents ? <DocumentEditor config={active} /> : <CollectionEditor config={active} />}</section>
}
