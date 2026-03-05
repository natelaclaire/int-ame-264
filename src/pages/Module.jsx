import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ResourceItem from '../components/ResourceItem'
import {
  exportModuleAsCommonCartridge,
  exportModuleAsBrightspaceCartridge
} from '../utils/commonCartridge'

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
  const resourcesForModule = useMemo(() => resources.filter(r => r.moduleSlug === slug), [resources, slug])
  const required = resourcesForModule.filter(r => r.required)
  const optional = resourcesForModule.filter(r => !r.required)

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
      <h1>Week {module.week}: {module.title}</h1>
      <p>{module.overview || <span className="muted">Overview coming soon.</span>}</p>
      <div className="cta-row">
        <Link to="/modules" className="btn">← Back to all modules</Link>
        <button type="button" className="btn" onClick={() => handleExport('standard')} disabled={Boolean(exporting)}>
          {exporting === 'standard' ? 'Exporting…' : 'Export Module (.imscc)'}
        </button>
        <button type="button" className="btn" onClick={() => handleExport('brightspace')} disabled={Boolean(exporting)}>
          {exporting === 'brightspace' ? 'Exporting…' : 'Export for Brightspace (.imscc)'}
        </button>
      </div>
      {exportError && <p className="muted">{exportError}</p>}

      <h2>Required</h2>
      <ul className="resources">
        {required.map(r => (
          <ResourceItem key={r.id} resource={r} loMap={loMap} />
        ))}
      </ul>

      <h2>Optional</h2>
      <ul className="resources">
        {optional.map(r => (
          <ResourceItem key={r.id} resource={r} loMap={loMap} />
        ))}
      </ul>
    </section>
  )
}
