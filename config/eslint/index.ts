// /* eslint-disable @typescript-eslint/naming-convention */
// /* config/eslint/index.js */
// import { readdirSync } from 'fs'
// import { basename, join, dirname } from 'path'
// import { fileURLToPath } from 'url'

// const projectName = 'ensure-esm-extensions'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// const ruleFiles = readdirSync(join(__dirname, 'rules'))
//   .filter(file => file !== 'index.ts' && !file.endsWith('spec.ts'))

// console.log('ruleFiles: ', ruleFiles)

// const configs = {
//   all: {
//     plugins: [projectName],
//     rules: Object.fromEntries(
//       ruleFiles.map(file => [
//         `${projectName}/${basename(file, '.ts')}`,
//         'error'
//       ])
//     )
//   }
// }

// const rules = Object.fromEntries(
//   ruleFiles.map(file => [import(join(__dirname, 'rules', file))])
// )

// export { configs, rules }
