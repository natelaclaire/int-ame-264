import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const modules = JSON.parse(fs.readFileSync(path.join(root, 'data/modules.json'), 'utf8'))
const resources = JSON.parse(fs.readFileSync(path.join(root, 'data/resources.json'), 'utf8'))
const outcomes = JSON.parse(fs.readFileSync(path.join(root, 'data/learningOutcomes.json'), 'utf8'))
const outputDir = path.join(root, 'public/downloads/modules')

fs.mkdirSync(outputDir, { recursive: true })

const colors = {
  ink: '#181817',
  muted: '#625f57',
  line: '#cbc7bc',
  paper: '#f1efe8',
  lime: '#d8ff38',
  blue: '#3157d5',
  coral: '#ff6b57'
}

const normalize = value => String(value ?? '')
  .replace(/[\u2010-\u2015\u2212]/g, '-')
  .replace(/\u00a0/g, ' ')

function plainMarkdown(value) {
  return normalize(value)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(^|\W)[*_]([^*_]+)[*_](?=\W|$)/g, '$1$2')
    .replace(/^\s*[-*+]\s+/gm, '- ')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

function sortedResourcesFor(slug) {
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

function groupByTopic(items) {
  return items.reduce((groups, resource) => {
    const topic = resource.topic || 'General'
    if (!groups.has(topic)) groups.set(topic, [])
    groups.get(topic).push(resource)
    return groups
  }, new Map())
}

function ensureSpace(doc, height) {
  if (doc.y + height > doc.page.height - 58) doc.addPage()
}

function drawRule(doc, color = colors.line) {
  doc.moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).strokeColor(color).lineWidth(0.7).stroke()
}

function addResource(doc, resource, outcomeMap) {
  ensureSpace(doc, 104)
  const startY = doc.y
  doc.roundedRect(54, startY, doc.page.width - 108, 19, 3).fill(resource.required ? colors.ink : colors.paper)
  doc.fillColor(resource.required ? colors.paper : colors.ink)
    .font('CourseSans-Bold').fontSize(8)
    .text(resource.required ? 'REQUIRED' : 'EXPLORE FURTHER', 62, startY + 5, { characterSpacing: 0.6 })
  doc.y = startY + 28
  doc.fillColor(colors.ink).font('CourseSans-Bold').fontSize(13).text(normalize(resource.title), 62, doc.y, { width: 468 })

  const details = [resource.type, resource.duration].filter(Boolean).map(normalize).join('  |  ')
  if (details) doc.moveDown(0.25).fillColor(colors.blue).font('CourseSans-Bold').fontSize(8).text(details.toUpperCase(), 62, doc.y)

  if (resource.url) {
    doc.moveDown(0.35).fillColor(colors.blue).font('CourseSans').fontSize(8.5)
      .text(normalize(resource.url), 62, doc.y, { width: 468, link: resource.url, underline: true })
  }

  if (resource.notes) {
    doc.moveDown(0.55).fillColor(colors.muted).font('CourseSans').fontSize(9.5)
      .text(plainMarkdown(resource.notes), 62, doc.y, { width: 468, lineGap: 2 })
  }

  if (resource.learningOutcomes?.length) {
    const labels = resource.learningOutcomes.map(id => {
      const outcome = outcomeMap.get(String(id))
      return `LO ${id}: ${normalize(outcome?.outcome || outcome?.title || 'Learning outcome')}`
    })
    doc.moveDown(0.55).fillColor(colors.ink).font('CourseSans-Italic').fontSize(8.5)
      .text(labels.join('\n'), 62, doc.y, { width: 468, lineGap: 1.5 })
  }
  doc.moveDown(0.8)
}

async function createModulePdf(module) {
  const filename = `week-${String(module.week).padStart(2, '0')}-module-guide.pdf`
  const outputPath = path.join(outputDir, filename)
  const moduleResources = sortedResourcesFor(module.slug)
  const topicGroups = groupByTopic(moduleResources)
  const outcomeMap = new Map(outcomes.map(outcome => [String(outcome.id), outcome]))

  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 54, right: 54, bottom: 58, left: 54 }, bufferPages: true, info: {
    Title: `Week ${module.week}: ${module.title}`,
    Subject: 'INT/AME 264 module guide and resources',
    Author: 'INT/AME 264'
  } })
  const stream = fs.createWriteStream(outputPath)
  doc.pipe(stream)
  doc.registerFont('CourseSans', 'C:/Windows/Fonts/arial.ttf')
  doc.registerFont('CourseSans-Bold', 'C:/Windows/Fonts/arialbd.ttf')
  doc.registerFont('CourseSans-Italic', 'C:/Windows/Fonts/ariali.ttf')

  doc.rect(0, 0, doc.page.width, 13).fill(colors.lime)
  doc.fillColor(colors.ink).font('CourseSans-Bold').fontSize(9)
    .text('INT/AME 264  /  MODULE GUIDE', 54, 38, { characterSpacing: 1.1 })
  doc.moveDown(2.1).fillColor(colors.blue).font('CourseSans-Bold').fontSize(12)
    .text(`WEEK ${String(module.week).padStart(2, '0')}  /  ${normalize(module.section).toUpperCase()}`)
  doc.moveDown(0.55).fillColor(colors.ink).font('CourseSans-Bold').fontSize(28)
    .text(normalize(module.title), { width: 504, lineGap: -1 })
  if (module.topic) {
    doc.moveDown(0.65).fillColor(colors.ink).font('CourseSans-Bold').fontSize(11)
      .text(normalize(module.topic), { width: 504, lineGap: 2 })
  }
  if (module.overview) {
    doc.moveDown(0.75).fillColor(colors.muted).font('CourseSans').fontSize(10.5)
      .text(normalize(module.overview), { width: 504, lineGap: 3 })
  }

  doc.moveDown(1.1)
  drawRule(doc, colors.ink)
  doc.moveDown(0.8).fillColor(colors.ink).font('CourseSans-Bold').fontSize(9)
    .text(`${moduleResources.length} ${moduleResources.length === 1 ? 'RESOURCE' : 'RESOURCES'}  /  ${topicGroups.size} ${topicGroups.size === 1 ? 'TOPIC' : 'TOPICS'}`, { characterSpacing: 0.6 })
  doc.moveDown(1.5)

  let topicNumber = 0
  for (const [topic, topicResources] of topicGroups) {
    topicNumber += 1
    ensureSpace(doc, 85)
    doc.fillColor(colors.coral).font('CourseSans-Bold').fontSize(9)
      .text(`TOPIC ${String(topicNumber).padStart(2, '0')}`)
    doc.moveDown(0.35).fillColor(colors.ink).font('CourseSans-Bold').fontSize(19)
      .text(normalize(topic), { width: 504 })
    doc.moveDown(0.45)
    drawRule(doc, colors.ink)
    doc.moveDown(0.8)

    for (const resource of topicResources.filter(item => item.required)) addResource(doc, resource, outcomeMap)
    for (const resource of topicResources.filter(item => !item.required)) addResource(doc, resource, outcomeMap)
    doc.moveDown(0.6)
  }

  const range = doc.bufferedPageRange()
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index)
    // Footer text intentionally sits inside the page's bottom margin.
    doc.page.margins.bottom = 0
    const footerY = doc.page.height - 37
    doc.moveTo(54, footerY - 8).lineTo(doc.page.width - 54, footerY - 8).strokeColor(colors.line).lineWidth(0.6).stroke()
    doc.fillColor(colors.muted).font('CourseSans').fontSize(7.5)
      .text(`WEEK ${String(module.week).padStart(2, '0')}  /  ${normalize(module.title)}`, 54, footerY, { width: 420, ellipsis: true })
      .text(`${index + 1} / ${range.count}`, doc.page.width - 104, footerY, { width: 50, align: 'right' })
  }

  doc.end()
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
  return filename
}

for (const module of modules) {
  const filename = await createModulePdf(module)
  console.log(`Built ${filename}`)
}
