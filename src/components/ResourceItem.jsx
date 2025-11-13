import Tooltip from './Tooltip'

export default function ResourceItem({ resource, loMap }) {
  const {
    title,
    url,
    type,
    duration,
    notes,
    learningOutcomes = [],
    required
  } = resource

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
      </div>
      {notes && <div className="notes">{notes}</div>}
      {learningOutcomes.length > 0 && (
        <div className="los">
          {learningOutcomes.map((id) => (
            <Tooltip key={id} label={loMap[id]?.outcome || loMap[id]?.title || ''}>
              <span className="badge lo">LO {id}</span>
            </Tooltip>
          ))}
        </div>
      )}
    </li>
  )
}
