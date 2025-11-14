import fs from 'node:fs'

const md = fs.readFileSync('starting-document.md', 'utf8')
const lines = md.split(/\r?\n/)
const target = lines.find(l => l.includes('History of Video Games Documentary'))
console.log('Line from file:')
console.log(target)
console.log('')
console.log('Hex of last 60 chars:')
const last60 = target.slice(-60)
console.log(Buffer.from(last60).toString('hex'))
console.log(last60)
