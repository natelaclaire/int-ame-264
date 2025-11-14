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
  // Normalize line endings: convert CRLF and bare CR to LF
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const lines = normalizedText.split(/\n/)
  
    // Pre-process lines to join any that are continuations of markdown links
    // If a line has an unclosed markdown link [...]( without matching ), join with next line
    const joinedLines = []
    let i = 0
    while(i < lines.length) {
      let line = lines[i]
      // Check if this line has an unclosed markdown link
      const openBracket = line.indexOf('[')
      if(openBracket !== -1) {
        const closeBracket = line.indexOf(']', openBracket)
        if(closeBracket !== -1 && line[closeBracket + 1] === '(') {
            if(line.includes('History of Video Games Documentary')){
              
            }
          // Count parens to see if URL is complete
          let parenDepth = 0
          for(let j = closeBracket + 1; j < line.length; j++) {
            if(line[j] === '(') parenDepth++
            else if(line[j] === ')') parenDepth--
          }
              if(line.includes('History of Video Games Documentary')){
                
              }
          // If parens don't balance, URL continues on next line(s)
          if(line.includes('History of Video Games Documentary')){
            
          }
          while(parenDepth > 0 && i + 1 < lines.length) {
            const nextLine = lines[i + 1]
            if(!nextLine) break
            
            line += nextLine  // Join without space - markdown already has line break
            // Update paren count
            for(let j = 0; j < nextLine.length; j++) {
              if(nextLine[j] === '(') parenDepth++
              else if(nextLine[j] === ')') parenDepth--
            }
            i++
          }
        }
      }
      if(line.includes('History of Video Games Documentary')){
        
      }
      joinedLines.push(line)
      i++
    }

    const bullets = []
  const bulletRegex = /^\*\s+(.+)/
    for(const raw of joinedLines){
    
    const b = raw.match(bulletRegex)
    if(!b) continue
    let line = b[1].trim()
    // Skip empty or navigation-only bullets
    if(!line) continue
    
    // Remove escaped markdown characters (e.g., `\)` -> `)`, `\!` -> `!`)
    line = line.replace(/\\([)!:])/g, '$1')

    // Extract type
    let type = ''
    let rest = line
    const typeMatch = rest.match(/^(.*?):\s*(.*)$/)
    if(typeMatch && /[A-Za-z]/.test(typeMatch[1])){
      type = typeMatch[1].trim()
      rest = typeMatch[2].trim()
    }
    

    // Extract first markdown link - need to handle URLs with parentheses
    let title = rest
    let url = null
    // Find opening [
    const openBracket = rest.indexOf('[')
    if(openBracket !== -1){
      const closeBracket = rest.indexOf(']', openBracket)
      if(closeBracket !== -1 && rest[closeBracket + 1] === '('){
        // Found a markdown link
        title = rest.slice(openBracket + 1, closeBracket).trim()
        // Find matching closing paren for URL - scan forward
        let parenDepth = 1
        let urlStart = closeBracket + 2
        let urlEnd = urlStart
        while(urlEnd < rest.length && parenDepth > 0){
          if(rest[urlEnd] === '(') parenDepth++
          else if(rest[urlEnd] === ')') parenDepth--
          if(parenDepth > 0) urlEnd++
        }
        url = rest.slice(urlStart, urlEnd).trim()
        
      }
    }
    if(!url){
      // Title may be plain text, trim trailing comments
      title = rest.replace(/\s*\(.+?\)\s*$/,'').trim()
    }

    // Extract LO tags - format is (LO 1, LO 2, LO 3) with repeated LO prefix
    const loNumbers = []
    // Match individual LO N patterns
    const loMatches = [...line.matchAll(/LO\s*(\d+)/gi)]
    let consumedLO = []
    for(const lom of loMatches){
      consumedLO.push(lom[0])
      loNumbers.push(Number(lom[1]))
    }

    // Extract duration (last parenthetical with 'min')
    let duration = ''
    const parens = [...line.matchAll(/\(([^)]*)\)/g)].map(m => m[1])
    for(let i=parens.length-1;i>=0;i--){
      if(/min/i.test(parens[i])){ duration = parens[i].trim(); break }
    }

    // Notes: remove link, LO tags, duration from original; keep any trailing descriptors
    let notes = line
    // If we extracted a link, replace the full markdown with just the title
    if(url){
      const linkStart = line.indexOf('[')
      const linkEnd = line.indexOf(')', linkStart)
      if(linkStart !== -1 && linkEnd !== -1){
        const fullLink = line.slice(linkStart, linkEnd + 1)
        notes = notes.replace(fullLink, title)
      }
    }
  for(const c of consumedLO){ notes = notes.replace(c, '') }
  if(duration) notes = notes.replace(new RegExp(`\\(${duration.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\)`), '')
  // Remove any leftover markdown link tails like "](...)": strip "](" to matching ")"
  notes = notes.replace(/\]\([^)]*\)/g, '')
  // Remove parentheses that contain only commas and/or whitespace
  notes = notes.replace(/\(\s*,[\s,]*\)/g, '')
  // Remove empty parentheses
  notes = notes.replace(/\(\s*\)/g, '')
  // Collapse multiple spaces
  notes = notes.replace(/\s{2,}/g, ' ')
  // Trim stray trailing punctuation like colon or dash if alone
  notes = notes.replace(/^[-:]+\s*/, '').replace(/\s*[-:]+$/, '')
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
  const reqMatch = body.match(/\*\*Readings\/Media:?\*\*[\s\S]*?(?=(\*\*Additional|\*\*Journal|##\s+\*\*Week|$))/i)
    if(reqMatch){
      
      resources.push(...parseBullets(reqMatch[0], true, module))
    }
  const addMatch = body.match(/\*\*Additional[\s\S]*?(?=(\*\*Journal|##\s+\*\*Week|$))/i)
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
