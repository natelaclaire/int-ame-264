import fs from 'node:fs'
import path from 'node:path'
import { modules, outcomes, outputDir, sortedResourcesFor, groupByTopic } from './module-guide-data.mjs'

// Escape plain data fields; resource notes already contain authored Markdown.
const escape = value => String(value ?? '').replace(/([\\`*_{}\[\]<>#!|])/g, '\\$1')
const outcomeMap = new Map(outcomes.map(outcome => [String(outcome.id), outcome]))

fs.mkdirSync(outputDir, { recursive: true })

for (const module of modules) {
  const resources = sortedResourcesFor(module.slug)
  const topics = groupByTopic(resources)
  const blocks = [
    '# INT/AME 264 / Module Guide',
    `Week ${String(module.week).padStart(2, '0')} / ${escape(module.section)}`,
    `## ${escape(module.title)}`,
    module.topic && escape(module.topic),
    module.overview && escape(module.overview),
    `${resources.length} ${resources.length === 1 ? 'resource' : 'resources'} / ${topics.size} ${topics.size === 1 ? 'topic' : 'topics'}`
  ].filter(Boolean)

  let topicNumber = 0
  for (const [topic, items] of topics) {
    blocks.push(`## Topic ${String(++topicNumber).padStart(2, '0')}: ${escape(topic)}`)
    for (const resource of [...items.filter(item => item.required), ...items.filter(item => !item.required)]) {
      blocks.push(`### ${escape(resource.title)}`, resource.required ? '**REQUIRED**' : '**EXPLORE FURTHER**')
      const details = [resource.type, resource.duration].filter(Boolean).map(escape).join(' | ')
      if (details) blocks.push(details)
      if (resource.url) blocks.push(`[${escape(resource.url)}](<${resource.url.replace(/>/g, '%3E').replace(/</g, '%3C')}>)`)
      if (resource.notes) blocks.push(resource.notes.trim())
      if (resource.learningOutcomes?.length) {
        blocks.push(resource.learningOutcomes.map(id => {
          const outcome = outcomeMap.get(String(id))
          return `- LO ${escape(id)}: ${escape(outcome?.outcome || outcome?.title || 'Learning outcome')}`
        }).join('\n'))
      }
    }
  }

  const filename = `week-${String(module.week).padStart(2, '0')}-module-guide.md`
  fs.writeFileSync(path.join(outputDir, filename), blocks.join('\n\n') + '\n')
  console.log(`Built ${filename}`)
}
