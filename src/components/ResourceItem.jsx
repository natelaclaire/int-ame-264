import Tooltip from './Tooltip'
import { Link } from 'react-router-dom'

export default function ResourceItem({ resource, loMap, showModuleMeta = false, moduleMap }) {
  const {
    title,
    url,
    type,
    duration,
    notes,
    learningOutcomes = [],
    required
  } = resource
  const moduleInfo = showModuleMeta && moduleMap ? moduleMap[resource.moduleSlug] : null

  return (
    <li className={`resource ${required ? 'required' : 'optional'}`}>
      <div className="resource-main">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer noopener">{title}</a>
        ) : (
          <span>{title}</span>
        )}
        {type && <span className="badge type">{type}</span>}
        {duration && <span className="badge duration">{duration}</span>}
        {showModuleMeta && (
          <>
            {moduleInfo ? (
              <Link to={`/modules/${moduleInfo.slug}`} className="badge module" title={`Week ${moduleInfo.week}: ${moduleInfo.title}`}>
                Week {moduleInfo.week}
              </Link>
            ) : (
              resource.moduleWeek ? <span className="badge module">Week {resource.moduleWeek}</span> : null
            )}
            <span className={`badge req ${required ? 'required' : 'optional'}`}>{required ? 'Required' : 'Optional'}</span>
          </>
        )}
      </div>
      {notes && <div className="notes">{notes}</div>}
      {learningOutcomes.length > 0 && (
        <div className="los">
          {learningOutcomes.map((id) => (
            <Tooltip key={id} label={loMap[id]?.outcome || loMap[id]?.title || ''}>
              <Link to={`/outcomes/${id}`} className="badge lo">LO {id}</Link>
            </Tooltip>
          ))}
        </div>
      )}
    </li>
  )
}
