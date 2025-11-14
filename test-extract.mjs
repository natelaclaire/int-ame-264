const line = 'YouTube: [The History of Video Games Documentary](https://www.youtube.com/watch?v=z7-BN0qdZDk&ab_channel=TheUpliftingGuy) (91 min) (LO 1)'

// Extract type
let type = ''
let rest = line
const typeMatch = rest.match(/^(.*?):\s*(.*)$/)
if(typeMatch && /[A-Za-z]/.test(typeMatch[1])){
  type = typeMatch[1].trim()
  rest = typeMatch[2].trim()
}

console.log('Type:', type)
console.log('Rest:', rest)
console.log('Rest length:', rest.length)

// Find opening [
const openBracket = rest.indexOf('[')
const closeBracket = rest.indexOf(']', openBracket)
console.log('Brackets:', openBracket, closeBracket)

if(closeBracket !== -1 && rest[closeBracket + 1] === '('){
  // Find matching closing paren for URL
  let parenDepth = 1
  let urlStart = closeBracket + 2
  let urlEnd = urlStart
  console.log('Scanning from position', urlStart)
  while(urlEnd < rest.length && parenDepth > 0){
    if(rest[urlEnd] === '(') {
      console.log('Found ( at', urlEnd, 'depth now', parenDepth + 1)
      parenDepth++
    }
    else if(rest[urlEnd] === ')') {
      console.log('Found ) at', urlEnd, 'depth now', parenDepth - 1, 'char:', rest[urlEnd - 2], rest[urlEnd - 1])
      parenDepth--
    }
    if(parenDepth > 0) urlEnd++
  }
  const url = rest.slice(urlStart, urlEnd).trim()
  console.log('Final URL:', url)
}
