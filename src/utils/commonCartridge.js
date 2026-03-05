import JSZip from 'jszip'

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeFileName(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function buildPageHtml({ title, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; max-width: 860px; margin: 32px auto; line-height: 1.5; color: #222; padding: 0 16px; }
    h1 { margin-bottom: 0.2rem; }
    .meta { color: #666; margin-top: 0; }
    .block { border: 1px solid #ddd; border-radius: 8px; padding: 12px 14px; margin: 12px 0; }
    a { color: #0b60b0; }
    ul { padding-left: 1.25rem; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`
}

function buildOverviewHtml(module, requiredResources, optionalResources, outcomeMap) {
  const requiredList = requiredResources.map((resource) => {
    const lo = (resource.learningOutcomes || [])
      .map((id) => outcomeMap[id])
      .filter(Boolean)
      .map((outcome) => `<li>${escapeHtml(outcome.outcome || outcome.title || `LO ${outcome.id}`)}</li>`)
      .join('')

    return `<div class="block">
      <h3>${escapeHtml(resource.title)}</h3>
      <p class="meta">${escapeHtml(resource.type || 'Resource')}${resource.duration ? ` | ${escapeHtml(resource.duration)}` : ''}</p>
      ${resource.url ? `<p><a href="${escapeHtml(resource.url)}">Open resource</a></p>` : ''}
      ${resource.notes ? `<p>${escapeHtml(resource.notes)}</p>` : ''}
      ${lo ? `<strong>Learning outcomes</strong><ul>${lo}</ul>` : ''}
    </div>`
  }).join('')

  const optionalList = optionalResources.map((resource) => {
    return `<li>${escapeHtml(resource.title)}${resource.url ? ` - <a href="${escapeHtml(resource.url)}">Open resource</a>` : ''}</li>`
  }).join('')

  return buildPageHtml({
    title: `Week ${module.week}: ${module.title}`,
    bodyHtml: `
      <h1>Week ${escapeHtml(module.week)}: ${escapeHtml(module.title)}</h1>
      <p>${escapeHtml(module.overview || '')}</p>
      <h2>Required Resources</h2>
      ${requiredList || '<p>No required resources listed.</p>'}
      <h2>Optional Resources</h2>
      ${optionalList ? `<ul>${optionalList}</ul>` : '<p>No optional resources listed.</p>'}
    `
  })
}

function buildResourceHtml(resource, module, outcomeMap) {
  const outcomes = (resource.learningOutcomes || [])
    .map((id) => outcomeMap[id])
    .filter(Boolean)
    .map((outcome) => `<li>${escapeHtml(outcome.outcome || outcome.title || `LO ${outcome.id}`)}</li>`)
    .join('')

  return buildPageHtml({
    title: resource.title,
    bodyHtml: `
      <h1>${escapeHtml(resource.title)}</h1>
      <p class="meta">Week ${escapeHtml(module.week)} | ${escapeHtml(module.title)}</p>
      <p><strong>Type:</strong> ${escapeHtml(resource.type || 'Resource')}</p>
      ${resource.duration ? `<p><strong>Estimated time:</strong> ${escapeHtml(resource.duration)}</p>` : ''}
      ${resource.url ? `<p><a href="${escapeHtml(resource.url)}">Open original resource</a></p>` : ''}
      ${resource.notes ? `<p>${escapeHtml(resource.notes)}</p>` : ''}
      ${outcomes ? `<h2>Learning Outcomes</h2><ul>${outcomes}</ul>` : ''}
    `
  })
}

function buildManifest({ module, entries }) {
  const manifestResources = entries.map((entry) => {
    return `    <resource identifier="${escapeXml(entry.identifier)}" type="${escapeXml(entry.type || 'webcontent')}" href="${escapeXml(entry.href)}">
      <file href="${escapeXml(entry.href)}"/>
    </resource>`
  }).join('\n')

  const organizationItems = entries.map((entry) => {
    return `      <item identifier="ITEM_${escapeXml(entry.identifier)}" identifierref="${escapeXml(entry.identifier)}">
        <title>${escapeXml(entry.title)}</title>
      </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="INTAME264-${escapeXml(module.week)}" xmlns="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1" xmlns:lom="http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1 http://www.imsglobal.org/profile/cc/ccv1p1/ccv1p1_imscp_v1p1_v1p0.xsd">
  <metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>1.1.0</schemaversion>
    <lom:lom>
      <lom:general>
        <lom:title>
          <lom:string>Week ${escapeXml(module.week)}: ${escapeXml(module.title)}</lom:string>
        </lom:title>
      </lom:general>
    </lom:lom>
  </metadata>
  <organizations>
    <organization identifier="ORG1">
      <title>Week ${escapeXml(module.week)}: ${escapeXml(module.title)}</title>
${organizationItems}
    </organization>
  </organizations>
  <resources>
${manifestResources}
  </resources>
</manifest>`
}

export async function exportModuleAsCommonCartridge({ module, resources, outcomes }) {
  const zip = new JSZip()
  const requiredResources = resources.filter((resource) => resource.required)
  const optionalResources = resources.filter((resource) => !resource.required)
  const outcomeMap = Object.fromEntries((outcomes || []).map((outcome) => [outcome.id, outcome]))

  const moduleSlug = sanitizeFileName(module.slug || `week-${module.week}`) || `week-${module.week}`
  const entries = []

  const overviewHref = `module/${moduleSlug}/overview.html`
  zip.file(overviewHref, buildOverviewHtml(module, requiredResources, optionalResources, outcomeMap))
  entries.push({ identifier: `RES_${moduleSlug}_overview`, href: overviewHref, title: `${module.title} Overview` })

  resources.forEach((resource, index) => {
    const resourceSlug = sanitizeFileName(resource.id || resource.title || `resource-${index + 1}`) || `resource-${index + 1}`
    const href = `module/${moduleSlug}/resources/${String(index + 1).padStart(2, '0')}-${resourceSlug}.html`
    zip.file(href, buildResourceHtml(resource, module, outcomeMap))
    entries.push({
      identifier: `RES_${moduleSlug}_${index + 1}`,
      href,
      title: resource.title || `Resource ${index + 1}`
    })
  })

  zip.file('imsmanifest.xml', buildManifest({ module, entries }))

  const blob = await zip.generateAsync({ type: 'blob' })
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `int-ame-264-week-${module.week}-${moduleSlug}.imscc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)
}

function buildWebLinkXml({ title, url }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<webLink xmlns="http://www.imsglobal.org/xsd/imswl_v1p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imswl_v1p0 http://www.imsglobal.org/profile/cc/ccv1p1/ccv1p1_imswl_v1p0.xsd">
  <title>${escapeXml(title)}</title>
  <url href="${escapeXml(url)}"/>
  <target>_blank</target>
</webLink>`
}

export async function exportModuleAsBrightspaceCartridge({ module, resources, outcomes }) {
  const zip = new JSZip()
  const requiredResources = resources.filter((resource) => resource.required)
  const optionalResources = resources.filter((resource) => !resource.required)
  const outcomeMap = Object.fromEntries((outcomes || []).map((outcome) => [outcome.id, outcome]))

  const moduleSlug = sanitizeFileName(module.slug || `week-${module.week}`) || `week-${module.week}`
  const entries = []

  const overviewHref = `module/${moduleSlug}/overview.html`
  zip.file(overviewHref, buildOverviewHtml(module, requiredResources, optionalResources, outcomeMap))
  entries.push({
    identifier: `RES_${moduleSlug}_overview`,
    href: overviewHref,
    title: `${module.title} Overview`,
    type: 'webcontent'
  })

  resources.forEach((resource, index) => {
    const linkFile = `links/${moduleSlug}-${String(index + 1).padStart(2, '0')}.xml`
    const linkTitle = resource.title || `Resource ${index + 1}`
    const safeUrl = resource.url || 'https://example.com/'
    zip.file(linkFile, buildWebLinkXml({ title: linkTitle, url: safeUrl }))

    const resourceType = resource.required ? 'Required' : 'Optional'
    const displayTitle = `${linkTitle} (${resourceType}${resource.type ? `, ${resource.type}` : ''})`

    entries.push({
      identifier: `RES_${moduleSlug}_link_${index + 1}`,
      href: linkFile,
      title: displayTitle,
      type: 'imswl_xmlv1p1'
    })
  })

  zip.file('imsmanifest.xml', buildManifest({ module, entries }))

  const blob = await zip.generateAsync({ type: 'blob' })
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `int-ame-264-week-${module.week}-${moduleSlug}-brightspace.imscc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)
}
