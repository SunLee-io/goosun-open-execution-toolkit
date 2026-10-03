// Validates every example payload against its v0 schema. Usage: npm install && npm run validate:examples
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const ajv = new Ajv2020({ strict: true, allErrors: true })
addFormats(ajv)
const schemaDir = 'schemas'
for (const f of readdirSync(schemaDir).filter(f => f.endsWith('.schema.json'))) ajv.addSchema(JSON.parse(readFileSync(join(schemaDir, f), 'utf8')))
const BASE = 'https://github.com/SunLee-io/goosun-open-execution-toolkit/schemas/'
const schemaFor = name =>
  name.startsWith('execution-intent') ? 'execution-intent' :
  name.startsWith('risk-decision') ? 'risk-decision' :
  name.startsWith('reconciliation-record') ? 'reconciliation-record' :
  name.startsWith('venue-capability') ? 'venue-capability' : null
let failed = 0
for (const chain of ['solana', 'bnb']) {
  for (const f of readdirSync(join('examples', chain)).filter(f => f.endsWith('.json'))) {
    const s = schemaFor(f)
    if (!s) continue
    const validate = ajv.getSchema(BASE + s + '.schema.json')
    const ok = validate(JSON.parse(readFileSync(join('examples', chain, f), 'utf8')))
    console.log((ok ? 'PASS ' : 'FAIL ') + chain + '/' + f + ' → ' + s)
    if (!ok) { failed++; console.log(validate.errors) }
  }
}
process.exit(failed ? 1 : 0)
