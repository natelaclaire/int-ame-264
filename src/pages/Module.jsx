import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ResourceItem from '../components/ResourceItem'
import {
  exportModuleAsCommonCartridge,
  exportModuleAsBrightspaceCartridge
} from '../utils/commonCartridge'
import { sortResources } from '../utils/resourceOrder'

export default function Module() {
  const { slug } = useParams()
  const [modules, setModules] = useState([])
  const [resources, setResources] = useState([])
  const [outcomes, setOutcomes] = useState([])
  const [exporting, setExporting] = useState('')
  const [exportError, setExportError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/data/modules.json').then(r => r.json()),
      fetch('/data/resources.json').then(r => r.json()),
      fetch('/data/learningOutcomes.json').then(r => r.json())
    ]).then(([mods, res, los]) => {
      setModules(mods)
      setResources(res)
      setOutcomes(los)
    })
  }, [])

  const module = useMemo(() => modules.find(m => m.slug === slug), [modules, slug])
  const loMap = useMemo(() => Object.fromEntries(outcomes.map(o => [o.id, o])), [outcomes])
  const resourcesForModule = useMemo(() => sortResources(resources.filter(r => r.moduleSlug === slug)), [resources, slug])
  const topics = useMemo(() => resourcesForModule.reduce((groups, resource) => {
    const topic = resource.topic || 'General'
    if (!groups[topic]) groups[topic] = []
    groups[topic].push(resource)
    return groups
  }, {}), [resourcesForModule])
  const pdfUrl = module ? `/downloads/modules/week-${String(module.week).padStart(2, '0')}-module-guide.pdf` : ''

  const handleExport = async (kind) => {
    if (!module) return
    setExportError('')
    setExporting(kind)
    try {
      const exporter = kind === 'brightspace'
        ? exportModuleAsBrightspaceCartridge
        : exportModuleAsCommonCartridge

      await exporter({
        module,
        resources: resourcesForModule,
        outcomes
      })
    } catch (error) {
      console.error('Export failed:', error)
      setExportError('Export failed. Please try again.')
    } finally {
      setExporting('')
    }
  }

  if (!module) return <p className="muted">Loading module…</p>

  return (
    <section>
      <div className="module-breadcrumb"><Link to="/modules">Modules</Link><span>→</span><span>{module.section}</span></div>
      <span className="eyebrow">WEEK {String(module.week).padStart(2, '0')}</span>
      <h1 className="module-title">{module.title}</h1>
      <p>{module.overview || <span className="muted">Overview coming soon.</span>}</p>
      <div className="cta-row">
        <Link to="/modules" className="btn">← Back to all modules</Link>
        <a className="btn btn-pdf" href={pdfUrl} download>
          Download module PDF
        </a>
        <button type="button" className="btn" onClick={() => handleExport('standard')} disabled={Boolean(exporting)}>
          {exporting === 'standard' ? 'Exporting…' : 'Export Module (.imscc)'}
        </button>
        <button type="button" className="btn" onClick={() => handleExport('brightspace')} disabled={Boolean(exporting)}>
          {exporting === 'brightspace' ? 'Exporting…' : 'Export for Brightspace (.imscc)'}
        </button>
      </div>
      {exportError && <p className="muted">{exportError}</p>}

      <div className="topic-directory">
        {Object.entries(topics).map(([topic, topicResources], index) => {
          const required = topicResources.filter(resource => resource.required)
          const optional = topicResources.filter(resource => !resource.required)
          return <section className="resource-topic" key={topic}>
            <header className="topic-header"><span>{String(index + 1).padStart(2, '0')}</span><div><div className="post-meta">TOPIC</div><h2>{topic}</h2></div><span>{topicResources.length} {topicResources.length === 1 ? 'RESOURCE' : 'RESOURCES'}</span></header>
            {required.length > 0 && <><h3 className="resource-label">Required</h3><ul className="resources">{required.map(resource => <ResourceItem key={resource.id} resource={resource} loMap={loMap} />)}</ul></>}
            {optional.length > 0 && <><h3 className="resource-label">Explore further</h3><ul className="resources">{optional.map(resource => <ResourceItem key={resource.id} resource={resource} loMap={loMap} />)}</ul></>}
          </section>
        })}
      </div>
    </section>
  )
}
