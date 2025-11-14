const line = '* YouTube: [The History of Video Games Documentary](https://www.youtube.com/watch?v=z7-BN0qdZDk&ab_channel=TheUpliftingGuy) (91 min) (LO 1)'

const rest = line.slice(line.indexOf(':') + 1).trim()
console.log('Rest:', rest)

// Find opening [
const openBracket = rest.indexOf('[')
console.log('Open bracket at:', openBracket)

if(openBracket !== -1){
  const closeBracket = rest.indexOf(']', openBracket)
  console.log('Close bracket at:', closeBracket)
  
  if(closeBracket !== -1 && rest[closeBracket + 1] === '('){
    // Found a markdown link
    const title = rest.slice(openBracket + 1, closeBracket).trim()
    console.log('Title:', title)
    
    // Find matching closing paren for URL - scan forward
    let parenDepth = 1
    let urlStart = closeBracket + 2
    let urlEnd = urlStart
    while(urlEnd < rest.length && parenDepth > 0){
      if(rest[urlEnd] === '(') parenDepth++
      else if(rest[urlEnd] === ')') parenDepth--
      if(parenDepth > 0) urlEnd++
    }
    const url = rest.slice(urlStart, urlEnd).trim()
    console.log('URL:', url)
    console.log('URL length:', url.length)
  }
}
