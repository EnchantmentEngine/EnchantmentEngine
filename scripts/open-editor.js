

import { exec } from 'child_process'
import util from 'util'

const promiseExec = util.promisify(exec)

const args = process.argv.slice(2)
args.map(async (arg) => {
  await promiseExec(`scripts/open_browser.sh ${arg}`)
})
