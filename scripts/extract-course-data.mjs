import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.cwd())
const mdPath = path.join(root, 'starting-document.md')
const dataDir = path.join(root, 'data')

function slugify(str){
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s:-]/g, '')
    .replace(/\s+/g,'-')
    .replace(/-+/g,'-')
    .slice(0, 80)
}

function readFile(){
  return fs.readFileSync(mdPath, 'utf8')
}

function extractLearningOutcomes(md){
  const out = []
  const loSectionMatch = md.match(/# Learning Outcomes[\s\S]*?(?=^# |\Z)/m)
  if(!loSectionMatch) return out
  const section = loSectionMatch[0]
  const lines = section.split(/\r?\n/)
  let i=0
  while(i < lines.length){
    const m = lines[i].match(/^\s*(\d+)\.\s+\*\*(.+?)\*\*/) // 1. **Title**
    if(m){
      const id = Number(m[1])
      const title = m[2].trim()
      let outcome = ''
      let indicators = ''
      let j=i+1
      while(j < lines.length && !/^\s*\d+\./.test(lines[j])){
        const l = lines[j]
        const mo = l.match(/\*\s*\*\*Outcome\*\*:\s*(.+)/i)
        if(mo) outcome = mo[1].trim()
        const mi = l.match(/\*\s*\*\*Indicators\*\*:\s*(.+)/i)
        if(mi) indicators = mi[1].trim()
        j++
      }
      out.push({ id, title, outcome, indicators, slug: `lo-${id}` })
      i = j
      continue
    }
    i++
  }
  return out
}

function splitWeekSections(md){
  // Fallback robust splitter: search literal marker '## **Week'
  const indices = []
  let pos = 0
  while(true){
    const idx = md.indexOf('## **Week', pos)
    if(idx === -1) break
    const lineEnd = md.indexOf('\n', idx)
    const headingLine = md.slice(idx, lineEnd === -1 ? undefined : lineEnd)
    const hm = headingLine.match(/Week\s+(\d+):\s*(.*?)\*\*/)
    if(hm){
      indices.push({ index: idx, week: Number(hm[1]), title: hm[2].trim(), heading: headingLine })
    }
    pos = (lineEnd === -1 ? md.length : lineEnd) + 1
  }
  const sections = []
  for(let k=0;k<indices.length;k++){
    const start = indices[k].index
    const end = k+1 < indices.length ? indices[k+1].index : md.length
    sections.push({ ...indices[k], body: md.slice(start, end) })
  }
  return sections
}

function extractModules(weekSections){
  return weekSections.map(({ week, title, body }) => {
    let topic = ''
    const tm = body.match(/\*\*Topic\*\*:?\s*(.+)/i)
    if (tm) topic = tm[1].trim()
    const slug = `week-${week}-${slugify(title)}`
    return { week, title, slug, topic, overview: '' }
  })
}

function parseBullets(text, required, module){
  const lines = text.split(/\r?\n/)
  const bullets = []
  const bulletRegex = /^\*\s+(.+)/
  for(const raw of lines){
    const b = raw.match(bulletRegex)
    if(!b) continue
    const line = b[1].trim()
    // Skip empty or navigation-only bullets
    if(!line) continue

    // Extract type
    let type = ''
    let rest = line
    const typeMatch = rest.match(/^(.*?):\s*(.*)$/)
    if(typeMatch && /[A-Za-z]/.test(typeMatch[1])){
      type = typeMatch[1].trim()
      rest = typeMatch[2].trim()
    }

    // Extract first markdown link
    let title = rest
    let url = null
    const linkMatch = rest.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if(linkMatch){
      title = linkMatch[1].trim()
      url = linkMatch[2].trim()
    } else {
      // Title may be plain text, trim trailing comments
      title = rest.replace(/\s*\(.+?\)\s*$/,'').trim()
    }

    // Extract LO tags
    const loNumbers = []
    const loRe = /\(\s*LO\s*([0-9,\s]+)\s*\)/gi
    let lom
    let consumedLO = []
    while((lom = loRe.exec(line))){
      consumedLO.push(lom[0])
      const nums = lom[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
      loNumbers.push(...nums)
    }

    // Extract duration (last parenthetical with 'min')
    let duration = ''
    const parens = [...line.matchAll(/\(([^)]*)\)/g)].map(m => m[1])
    for(let i=parens.length-1;i>=0;i--){
      if(/min/i.test(parens[i])){ duration = parens[i].trim(); break }
    }

    // Notes: remove link, LO tags, duration from original; keep any trailing descriptors
    let notes = line
    if(linkMatch) notes = notes.replace(linkMatch[0], title)
    for(const c of consumedLO){ notes = notes.replace(c, '') }
    if(duration) notes = notes.replace(new RegExp(`\\(${duration.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\)`), '')
    // Remove type prefix safely using plain string ops
    if(type && notes.startsWith(type)) {
      const prefix = type + ':'
      if(notes.startsWith(prefix)) notes = notes.slice(prefix.length).trimStart()
    }
    notes = notes.trim()
    if(notes === title) notes = ''

    // Filter out lines that are section headers or journals masquerading as bullets
    if(/^Journal/i.test(title)) continue

    const id = slugify(`${module.slug}-${type}-${title}`)
    bullets.push({
      id,
      moduleSlug: module.slug,
      moduleWeek: module.week,
      title,
      url,
      type,
      duration,
      notes,
      learningOutcomes: Array.from(new Set(loNumbers)).sort((a,b)=>a-b),
      required: !!required
    })
  }
  return bullets
}

function extractResources(md, weekSections, modules){
  const resources = []
  for(const section of weekSections){
    const module = modules.find(m => m.week === section.week)
    const body = section.body
    // Required: between Readings/Media and Additional/Journal/next
    const reqMatch = body.match(/\*\*Readings\/Media:?\*\*[\s\S]*?(?=(\*\*Additional|\*\*Journal|##\s+\*\*Week|\Z))/i)
    if(reqMatch){
      resources.push(...parseBullets(reqMatch[0], true, module))
    }
    const addMatch = body.match(/\*\*Additional[\s\S]*?(?=(\*\*Journal|##\s+\*\*Week|\Z))/i)
    if(addMatch){
      resources.push(...parseBullets(addMatch[0], false, module))
    }
  }
  // Deduplicate by id
  const dedup = Object.values(Object.fromEntries(resources.map(r => [r.id, r])))
  return dedup
}

function main(){
  const md = readFile()
  const outcomes = extractLearningOutcomes(md)
  const weekSections = splitWeekSections(md)
  const modules = extractModules(weekSections)
  const resources = extractResources(md, weekSections, modules)

  if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
  fs.writeFileSync(path.join(dataDir, 'learningOutcomes.json'), JSON.stringify(outcomes, null, 2))
  fs.writeFileSync(path.join(dataDir, 'modules.json'), JSON.stringify(modules, null, 2))
  fs.writeFileSync(path.join(dataDir, 'resources.json'), JSON.stringify(resources, null, 2))
  console.log(`Wrote ${outcomes.length} outcomes, ${modules.length} modules, ${resources.length} resources.`)
}

main()
