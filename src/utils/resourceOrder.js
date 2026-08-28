export function compareResourceOrder(a, b) {
  const aOrder = Number.isFinite(a.order) ? a.order : Number.MAX_SAFE_INTEGER
  const bOrder = Number.isFinite(b.order) ? b.order : Number.MAX_SAFE_INTEGER
  return aOrder - bOrder
}

export function sortResources(resources) {
  return resources
    .map((resource, index) => ({ resource, index }))
    .sort((a, b) => compareResourceOrder(a.resource, b.resource) || a.index - b.index)
    .map(({ resource }) => resource)
}
