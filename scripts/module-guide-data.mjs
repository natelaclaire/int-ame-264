import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const modules = JSON.parse(fs.readFileSync(path.join(root, 'data/modules.json'), 'utf8'))
const resources = JSON.parse(fs.readFileSync(path.join(root, 'data/resources.json'), 'utf8'))
export const outcomes = JSON.parse(fs.readFileSync(path.join(root, 'data/learningOutcomes.json'), 'utf8'))
export const outputDir = path.join(root, 'public/downloads/modules')

export function sortedResourcesFor(slug) {
  return resources
    .map((resource, index) => ({ resource, index }))
    .filter(({ resource }) => resource.moduleSlug === slug)
    .sort((a, b) => {
      const aOrder = Number.isFinite(a.resource.order) ? a.resource.order : Number.MAX_SAFE_INTEGER
      const bOrder = Number.isFinite(b.resource.order) ? b.resource.order : Number.MAX_SAFE_INTEGER
      return aOrder - bOrder || a.index - b.index
    })
    .map(({ resource }) => resource)
}

export function groupByTopic(items) {
  return items.reduce((groups, resource) => {
    const topic = resource.topic || 'General'
    if (!groups.has(topic)) groups.set(topic, [])
    groups.get(topic).push(resource)
    return groups
  }, new Map())
}
