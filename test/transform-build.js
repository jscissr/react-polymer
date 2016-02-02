// This is used in package.json pretest script, it transforms Vulcanize output
const readline = require('readline')
const rl = readline.createInterface(process.stdin, process.stdout)

rl.on('line', line => {
  process.stdout.write(line
    .replace('<html><head><meta charset="UTF-8">', '')
    .replace('</head><body>', '')
    .replace('</body></html>', '') + '\n')
})
