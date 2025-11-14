const line = '* Audio: [Maine Calling: Video Games](https://www.mainepublic.org/show/maine-calling/2024-12-02/video-games) (51 min) (LO 2, LO 3, LO 4, LO 7)'

// Simulate cleaning
const cleaned = line.replace(/\\([)!:])/g, '$1')
console.log('Cleaned line:', cleaned)

// Extract link
const linkMatch = cleaned.match(/\[([^\]]+)\]\(([^)]+)\)/)
if (linkMatch) {
  console.log('Title:', linkMatch[1])
  console.log('URL:', linkMatch[2])
}

// Extract LOs
const loMatches = [...cleaned.matchAll(/\(\s*LO\s*([0-9,\s]+)\s*\)/gi)]
const los = []
for(const lom of loMatches){
  const nums = lom[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
  los.push(...nums)
}
console.log('LOs found:', los)
