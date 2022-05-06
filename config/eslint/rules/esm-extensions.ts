import type { Rule } from 'eslint'
import type { ImportDeclaration, VariableDeclaration, SimpleLiteral, Expression , Super, Literal, ExportAllDeclaration, ExportNamedDeclaration } from 'estree'
import {  accessSync } from 'fs'
import { resolve, dirname, relative } from 'path'

// resolve('', '')
declare module 'estree' {
  interface ImportDeclaration {
    importKind: string
  }
  interface SimpleLiteral {
    name?: string
  }
}

interface GetListenerOptions {
  context: Rule.RuleContext
  name?: string
}
type ExportDeclaration = ExportAllDeclaration | ExportNamedDeclaration

const extensions = ['.js', '.ts', '.mjs', '.cjs']
extensions.push(...extensions.map((ext) => `/index${ext}`))

// TypeScript Guards
const isSimpleLiteralCallee = (callee: Expression | Super): callee is SimpleLiteral => callee != null && callee.type === 'Identifier' && (callee as unknown as SimpleLiteral).name != null

// ReportFixers
const getEsmImportFixer = (tokenLiteral: Literal, updated: string): Rule.ReportFixer => (fixer) => {
  return fixer.replaceText(excludeParenthesisFromTokenLocation(tokenLiteral), updated)
}

// util functions
const fileExists = (filePath: string) => {
  type FileAccessError = Error & { code: string, syscall: 'access', errno: number, path: string }
  try {
    accessSync(filePath)
    return true
  } catch (err) {
    if ((err as FileAccessError)?.code === 'ENOENT') {
      // known and somewhat expected failure case.
      return false
    }
    console.error('Unexpected error attempting to access filepath', filePath)
    console.error(err)
    return false
  }
}

const excludeParenthesisFromTokenLocation = (token: Literal): Literal => {
  if (token.range == null || token.loc == null) {
    return token
  }
  const rangeStart = token.range[0] + 1
  const rangeEnd = token.range[1] - 1
  const locColStart = token.loc.start.column + 1
  const locColEnd = token.loc.end.column - 1
  const newToken: Literal = {
    ...token,
    range: [rangeStart, rangeEnd],
    loc: {
      start: {...token.loc.start, column: locColStart },
      end: {...token.loc.end, column: locColEnd },
    },
  }

  return newToken
}

const handleNodeWithImport = (context: Rule.RuleContext, node: (ImportDeclaration | ExportDeclaration) & Rule.NodeParentExtension) => {
  if (node.source == null) {
    return
  }
  const importSource = node.source as Literal
  const importedPath = importSource.value
  if (typeof importedPath !== 'string' || importedPath[0] !== '.') {
    return
  }
  const cwd = context.getCwd()
  const filename = context.getFilename()
  const relativeFilePath = relative(cwd, filename)
  const relativeSourceFileDir = dirname(relativeFilePath)
  const absoluteSourceFileDir = resolve(cwd, relativeSourceFileDir)
  const importHasJsExtension = importedPath.match(/\.js$/)
  const importedFileAbsolutePath = resolve(absoluteSourceFileDir, importedPath)

  let correctImportAbsolutePath = null
  if (importHasJsExtension == null) {
    // no extension, try different ones.
    try {

      for (const ext of extensions) {
        const path = `${importedFileAbsolutePath}${ext}`
        if (fileExists(path)) {
          correctImportAbsolutePath = path
          break;
        }
      }
    } catch (err) {
      console.error(err)
    }
  } else {
    // extension exists, try to access it.
    if (fileExists(importedFileAbsolutePath)) {
      correctImportAbsolutePath = importedFileAbsolutePath
    } else if (relativeFilePath.match(/\.ts/) != null) {

      // if we're in a typescript repo and they're using .js extensions, they wont exist in the source.
      const typescriptImportedFileAbsolutePath = importedFileAbsolutePath.replace(/\.js/, '.ts')
      if (fileExists(typescriptImportedFileAbsolutePath)) {
        correctImportAbsolutePath = importedFileAbsolutePath
      } else {
        console.log('importedFileAbsolutePath doesnt exist', importedFileAbsolutePath)
        console.log('typescriptImportedFileAbsolutePath doesnt exist', typescriptImportedFileAbsolutePath)
        console.log('node', node)
        throw new Error('Workaround not implemented')
      }
    } else {
      console.log('importedFileAbsolutePath doesnt exist', importedFileAbsolutePath)
      console.log('And the file being checked is not a typescript file:', relativeFilePath)
      throw new Error('Workaround not implemented')
    }
  }

  const importOrExportLabel = node.type.match(/import/i) != null ? 'import of' : 'export from'

  if (correctImportAbsolutePath == null) {
    context.report({
      message: `Could not determine whether current import path of '${importedPath}' is valid or not`,
      node
    })
  } else {
    if (importedFileAbsolutePath !== correctImportAbsolutePath) {
      const correctImportPath = relative(absoluteSourceFileDir, correctImportAbsolutePath)
      const suggestionDesc = `Use '${correctImportPath}' instead.`
      const fix = getEsmImportFixer(importSource, correctImportPath)

      context.report({
        message: `Invalid ESM ${importOrExportLabel} '${importedPath}'. ${suggestionDesc}`,
        node,
        suggest: [
          {
            desc: suggestionDesc,
            fix,
          }
        ],
        fix,
      })
    }
  }
}

// Rule Listeners
const getVariableDeclarationListener = ({ context }: GetListenerOptions) => function (node: VariableDeclaration & Rule.NodeParentExtension) {
  const sourceCode = context.getSourceCode()
  const nodeSource = sourceCode.getText(node)
  if (nodeSource.match(/= require\([^)]+\)/)) {
    node.declarations.forEach((declaration) => {
      if (declaration.init && declaration.init.type === 'CallExpression') {
        const { callee } = declaration.init
        if (isSimpleLiteralCallee(callee) && callee.name === 'require') {
          context.report({
            message: "Do not use require inside of ESM modules",
            node,
          })
        }
      }
    })
  }
}

const getImportDeclarationListener = ({context}: GetListenerOptions) => function (node: ImportDeclaration & Rule.NodeParentExtension) {
  handleNodeWithImport(context, node)
}

const getExportDeclarationListener = ({context, name}: GetListenerOptions) => function (node: ExportDeclaration & Rule.NodeParentExtension) {
  const sourceCode = context.getSourceCode()
  const exportSource = sourceCode.getText(node)
  if (exportSource.match(/ from /) == null) {
    return
  }
  handleNodeWithImport(context, node)
}

// Rule
const esmExtensionsRule: Rule.RuleModule = {
  meta: {
    hasSuggestions: true,
    fixable: 'code'
  },
  create: (context: Rule.RuleContext) => ({
      VariableDeclaration: getVariableDeclarationListener({ context }),
      ExportAllDeclaration: getExportDeclarationListener({context, name: 'ExportAllDeclaration'}),
      ExportDeclaration: getExportDeclarationListener({context, name: 'ExportDeclaration'}),
      ExportNamedDeclaration: getExportDeclarationListener({context, name: 'ExportNamedDeclaration'}),
      ImportDeclaration: getImportDeclarationListener({context}),
  })
}

// @ts-ignore
// ignoring this rule because we use tsconfig.rules.json which is outputting cjs, not esm
export = esmExtensionsRule
