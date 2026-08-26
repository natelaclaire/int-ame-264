import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = async name => JSON.parse(await readFile(resolve(root, 'data', name), 'utf8'))
const [outcomes, modules, resources] = await Promise.all([
  readJson('learningOutcomes.json'),
  readJson('modules.json'),
  readJson('resources.json')
])

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const slugify = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const xhtml = (title, body) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head><meta charset="UTF-8"/><title>${escapeHtml(title)}</title><link rel="stylesheet" type="text/css" href="styles.css"/></head>
<body>${body}</body></html>`

const sections = [...new Set(modules.map(module => module.section || 'Course Modules'))]
const outcomeMap = Object.fromEntries(outcomes.map(outcome => [outcome.id, outcome]))
const sectionEntries = []
const moduleEntries = []

for (const [sectionIndex, sectionName] of sections.entries()) {
  const sectionModules = modules.filter(module => (module.section || 'Course Modules') === sectionName)
  const sectionId = `section-${sectionIndex + 1}`
  const sectionFile = `${sectionId}.xhtml`
  sectionEntries.push({ id: sectionId, file: sectionFile, title: sectionName, modules: sectionModules })

  for (const module of sectionModules) {
    const file = `module-${module.week}-${slugify(module.title)}.xhtml`
    moduleEntries.push({ id: `module-${module.week}`, file, title: `Week ${module.week}: ${module.title}`, module, sectionId })
  }
}

const zip = new JSZip()
zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`)

const css = `body{font-family:Georgia,serif;line-height:1.55;color:#171817;margin:5%;}h1,h2,h3{font-family:Arial,sans-serif;line-height:1.15;}h1{font-size:2.2em;border-bottom:4px solid #4057f5;padding-bottom:.25em;}h2{margin-top:2em;}h3{margin-top:1.5em;}a{color:#3047d9;}nav ol{line-height:1.8;}.eyebrow,.meta,.label{font-family:monospace;text-transform:uppercase;letter-spacing:.06em;font-size:.8em}.section{page-break-before:always}.module-overview{font-size:1.1em}.resource{border-top:1px solid #aaa;padding:1em 0;break-inside:avoid}.resource h4{font-family:Arial,sans-serif;font-size:1.08em;margin:0 0 .4em}.resource dl{display:grid;grid-template-columns:max-content 1fr;gap:.25em .75em;margin:.5em 0}.resource dt{font-weight:bold}.resource dd{margin:0}.notes{margin-top:.7em}.outcome{margin-bottom:1.6em}.outcome h2{font-size:1.25em;margin-bottom:.4em}`
zip.file('EPUB/styles.css', css)

const outcomesBody = `<p class="eyebrow">INT/AME 264</p><h1>Learning Outcomes</h1>${outcomes.map(outcome => `<section class="outcome" id="lo-${outcome.id}"><h2>LO ${outcome.id}: ${escapeHtml(outcome.title)}</h2><p>${escapeHtml(outcome.outcome)}</p>${outcome.indicators ? `<p><strong>Indicators:</strong> ${escapeHtml(outcome.indicators)}</p>` : ''}</section>`).join('')}`
zip.file('EPUB/learning-outcomes.xhtml', xhtml('Learning Outcomes', outcomesBody))

for (const section of sectionEntries) {
  const listedModules = section.modules.map(module => `<li><a href="${moduleEntries.find(entry => entry.module.week === module.week).file}">Week ${module.week}: ${escapeHtml(module.title)}</a></li>`).join('')
  zip.file(`EPUB/${section.file}`, xhtml(section.title, `<section class="section"><p class="eyebrow">COURSE SECTION</p><h1>${escapeHtml(section.title)}</h1><ol>${listedModules}</ol></section>`))
}

for (const entry of moduleEntries) {
  const moduleResources = resources.filter(resource => resource.moduleSlug === entry.module.slug)
  const topics = [...new Set(moduleResources.map(resource => resource.topic || 'General'))]
  const topicsMarkup = topics.map(topic => {
    const topicResources = moduleResources.filter(resource => (resource.topic || 'General') === topic)
    const groupMarkup = (label, matches) => matches.length ? `<section><h3>${label}</h3>${matches.map(resource => {
      const linkedTitle = resource.url ? `<a href="${escapeHtml(resource.url)}">${escapeHtml(resource.title)}</a>` : escapeHtml(resource.title)
      const learningOutcomes = (resource.learningOutcomes || []).map(id => {
        const outcome = outcomeMap[id]
        return outcome ? `LO ${id}: ${outcome.title}` : `LO ${id}`
      }).join('; ')
      return `<article class="resource"><h4>${linkedTitle}</h4><dl><dt>Type</dt><dd>${escapeHtml(resource.type || 'Not specified')}</dd><dt>Duration</dt><dd>${escapeHtml(resource.duration || 'Not specified')}</dd><dt>Learning outcomes</dt><dd>${escapeHtml(learningOutcomes || 'None specified')}</dd></dl><p class="notes"><strong>Notes:</strong> ${escapeHtml(resource.notes || 'No notes provided.')}</p></article>`
    }).join('')}</section>` : ''
    return `<section><h2>${escapeHtml(topic)}</h2>${groupMarkup('Required', topicResources.filter(resource => resource.required))}${groupMarkup('Optional', topicResources.filter(resource => !resource.required))}</section>`
  }).join('')
  const body = `<p class="eyebrow">${escapeHtml(entry.module.section)} · WEEK ${entry.module.week}</p><h1>${escapeHtml(entry.module.title)}</h1><p class="module-overview">${escapeHtml(entry.module.overview || 'Overview coming soon.')}</p>${topicsMarkup}`
  zip.file(`EPUB/${entry.file}`, xhtml(entry.title, body))
}

const navSections = sectionEntries.map(section => `<li><a href="${section.file}">${escapeHtml(section.title)}</a><ol>${moduleEntries.filter(entry => entry.sectionId === section.id).map(entry => `<li><a href="${entry.file}">${escapeHtml(entry.title)}</a></li>`).join('')}</ol></li>`).join('')
zip.file('EPUB/nav.xhtml', xhtml('Contents', `<nav epub:type="toc" xmlns:epub="http://www.idpf.org/2007/ops"><h1>Contents</h1><ol><li><a href="learning-outcomes.xhtml">Learning Outcomes</a></li>${navSections}</ol></nav>`))

const manifest = [
  '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
  '<item id="css" href="styles.css" media-type="text/css"/>',
  '<item id="outcomes" href="learning-outcomes.xhtml" media-type="application/xhtml+xml"/>',
  ...sectionEntries.map(entry => `<item id="${entry.id}" href="${entry.file}" media-type="application/xhtml+xml"/>`),
  ...moduleEntries.map(entry => `<item id="${entry.id}" href="${entry.file}" media-type="application/xhtml+xml"/>`)
].join('')
const spine = ['outcomes', ...sectionEntries.flatMap(section => [section.id, ...moduleEntries.filter(entry => entry.sectionId === section.id).map(entry => entry.id)])].map(id => `<itemref idref="${id}"/>`).join('')
const modified = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
zip.file('EPUB/package.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="en"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"><dc:identifier id="book-id">urn:uuid:7b575585-21b8-46c7-8d71-264c0a5e2026</dc:identifier><dc:title>INT/AME 264: The History and Culture of Video Gaming</dc:title><dc:creator>Nate LaClaire</dc:creator><dc:language>en</dc:language><dc:description>Learning outcomes, modules, and curated resources for INT/AME 264.</dc:description><meta property="dcterms:modified">${modified}</meta></metadata><manifest>${manifest}</manifest><spine>${spine}</spine></package>`)

const output = resolve(root, 'public', 'downloads', 'int-ame-264-course.epub')
await mkdir(dirname(output), { recursive: true })
await writeFile(output, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } }))
console.log(`✓ Built course ePub with ${modules.length} modules and ${resources.length} resources`)
