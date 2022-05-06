/* eslint-disable no-console */
import type { Rule, SourceCode } from 'eslint'
import type { ImportDeclaration, ExportAllDeclaration, VariableDeclaration, SimpleLiteral, Expression , Super, Literal} from 'estree'
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

const extensions = ['.js', '.ts', '.mjs', '.cjs']
extensions.push(...extensions.map((ext) => `/index${ext}`))

// TypeScript Guards
const isSimpleLiteralCallee = (callee: Expression | Super): callee is SimpleLiteral => callee != null && callee.type === 'Identifier' && (callee as unknown as SimpleLiteral).name != null

// ReportFixers
const convertRequireToImport: Rule.ReportFixer = (fixer) => {
  const fix: Rule.Fix = {
    range: [0,0],
    text: ''
  }

  return fix
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

interface GetListenerOptions {
  context: Rule.RuleContext
  sourceCode: SourceCode
}
const getVariableDeclarationListener = ({ context, sourceCode }: GetListenerOptions) => async function (node: VariableDeclaration & Rule.NodeParentExtension) {
          const nodeSource = sourceCode.getText(node)
          if (nodeSource.match(/= require\([^)]+\)/)) {
            // console.log(`VariableDeclaration.sourceCode: `, nodeSource);
            // console.log(`node.kind: `, node.kind);
            // console.log(`node.type: `, node.type);
            // console.log(`node.declarations: `, node.declarations);
            node.declarations.forEach((declaration) => {
              // console.log(`declaration.init: `, declaration.init);
              if (declaration.init && declaration.init.type === 'CallExpression') {
                const { callee } = declaration.init
                if (isSimpleLiteralCallee(callee) && callee.name === 'require') {
                  context.report({
                    message: "Do not use require inside of ESM modules",
                    node,
                    suggest: [
                      {
                        desc: 'Switch to an import statement',
                        fix: convertRequireToImport,
                      },
                    ]
                  })
                }
              }
            })
          }
        }
getVariableDeclarationListener
// Rule
const esmExtensionsRule: Rule.RuleModule = {
  meta: {
    hasSuggestions: true,
    fixable: 'code'
  },
  create: (context: Rule.RuleContext) => {
    // console.log()
    // console.log('---start of file---')
    // console.log(`context.settings: `, context.settings);
    const cwd = context.getCwd()
    // console.log(`cwd: `, cwd);
    const sourceCode = context.getSourceCode();
    sourceCode.ast
    const filename = context.getFilename()
    // console.log(`filename: `, filename);
    const relativeFilePath = relative(cwd, filename)
    // console.log(`relativeFilePath: `, relativeFilePath);
    const relativeSourceFileDir = dirname(relativeFilePath)
    // console.log(`relativeSourceFileDir: `, relativeSourceFileDir);
    const absoluteSourceFileDir = resolve(cwd, relativeSourceFileDir)
    // console.log(`absoluteSourceFileDir: `, absoluteSourceFileDir);

    const listeners: Rule.RuleListener = {
      // ImportDeclaration: (node: ESTree.ImportDeclaration & Rule.NodeParentExtension) => {
      //   console.log('ImportDeclaration node.source.value: ', node.source.value)
      //   context.report({
      //     message: `ImportDeclaration node.source.value:  ${node.source.value as string}`,
      //     node
      //   })
      // },
      ExportDeclaration: function (node: ExportAllDeclaration & Rule.NodeParentExtension) {

        },
        VariableDeclaration: getVariableDeclarationListener({ context, sourceCode }),
        ImportDeclaration: function (node: ImportDeclaration & Rule.NodeParentExtension) {
          // console.log()
          // console.log(`sourceCode.getText(node): `, sourceCode.getText(node));

          // console.log(`node.type: `, node.type);
          // console.log(`node.importKind: `, node.importKind);
          const importedPath = node.source.value
          if (typeof importedPath !== 'string' || importedPath[0] !== '.') {
            // console.log(`importedPath of '${importedPath}' is not relative import, aborting rule early.`)
            return
          }
          // console.log()
          // console.log(`importedPath: `, importedPath);
          const importHasJsExtension = importedPath.match(/\.js$/)
          // console.log(`importHasJsExtension: `, importHasJsExtension);

          // if (!importHasJsExtension) {
          //   context.report({
          //     message: 'ESM imports require absolute filepaths including extensions. Use ".js" even for typescript files.',
          //     node,
          //   })
          //   return
          // }

          // console.log(`join(relativeSourceFileDir, importedPath): `, join(relativeSourceFileDir, importedPath));
          const importedFileAbsolutePath = resolve(absoluteSourceFileDir, importedPath)
          let correctImportAbsolutePath = null
          if (importHasJsExtension == null) {
            // no extension, try different ones.
            try {

              for (const ext of extensions) {
                // console.log(`ext: `, ext);
                const path = `${importedFileAbsolutePath}${ext}`
                // console.log(`path: `, path);
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
            try {

            if (fileExists(importedFileAbsolutePath)) {
              correctImportAbsolutePath = importedFileAbsolutePath
            } else {
              // console.log('throwing error')
              throw new Error('Not implemented')
            }
            } catch (err) {
              console.error(err)
            }
          }

          // console.log(`importedFileAbsolutePath: `, importedFileAbsolutePath);
          // console.log(`correctImportAbsolutePath: `, correctImportAbsolutePath);
          if (correctImportAbsolutePath == null) {
            context.report({
              message: `Could not determine whether current import path of '${importedPath}' is valid or not`,
              node
            })
          } else {
            if (importedFileAbsolutePath !== correctImportAbsolutePath) {
              const correctImportPath = relative(absoluteSourceFileDir, correctImportAbsolutePath)
              // console.log(node.source.loc?.start)
              // console.log(`node.source.loc: `, node.source.loc);
              // console.log(`node.source.loc?.start: `, node.source.loc?.start);
              // console.log(`node.source.loc?.end: `, node.source.loc?.end);
              // console.log('node', node)
              context.report({
                message: `Invalid ESM import of '${importedPath}'.`,
                node,
                suggest: [
                  {
                    desc: `Use '${correctImportPath}' instead.`,
                    fix: (fixer) => {
                      return fixer.replaceText(node.source, correctImportPath)
                    }
                  }
                ],
                fix: (fixer) => {
                  return fixer.replaceText(excludeParenthesisFromTokenLocation(node.source), correctImportPath)
                }
              })
            }
          }
          // resolve(dir)
          // console.log(`relative(__dirname, relativeSourceFileDir): `, relative(__dirname, relativeSourceFileDir));
          // console.log(`"${filename}" is importing "${importedPath}" from directory "${relativeSourceFileDir}"`);
          // console.log(`resolve(relativeSourceFileDir, importedPath): `, resolve(__dirname, relativeSourceFileDir, importedPath));
          // console.log(`importedPath: `, importedPath);
          // const nodeSource = sourceCode.getText(node)

          // node.specifiers.forEach((specifier) => {
          //   // console.log(`specifier.type: `, specifier.type);

          //   if ((specifier as ImportSpecifier).imported !== null) {

          //     const importedObjectName = (specifier as ImportSpecifier).imported?.name
          //     const localObjectName = specifier.local?.name
          //     if (importedObjectName == null || localObjectName == null) {
          //       console.log('importedObjectName is undefined, check out the specifier', specifier)
          //     } else {
          //       const wasRenamed = localObjectName != null && importedObjectName !== localObjectName
          //       console.log(`was ${importedObjectName} renamed to ${localObjectName} ? ${wasRenamed ? 'yes' : 'no'}!`)
          //     }
          //   }
          // })

          // console.log('ImportDeclaration node', node)
          // console.log('ImportDeclaration node.parent.body', node.parent.body)
          // console.log('ImportDeclaration node.specifiers', node.specifiers)
            // console.log('ImportDeclaration node.source.value: ', node.source.value);
            // context.report({
            //     message: "ImportDeclaration source:  ".concat(nodeSource),
            //     node
            // });
        },
      // ImportD'efaultSpecifier: (node: ESTree.ImportDefaultSpecifier & Rule.NodeParentExtension) => {
      //   console.log('ImportDeclaration node.source.value: ', node.source.value)
      // },
      // ImportExpression: (node: ESTree.ImportExpression & Rule.NodeParentExtension) => {
      //   console.log('ImportDeclaration node.source.value: ', node.source.range)
      // },
      // ImportNamespaceSpecifier: (node: ESTree.ImportNamespaceSpecifier & Rule.NodeParentExtension) => {
      //   console.log('ImportDeclaration node.source.value: ', node.source.value)
      // },
      // ImportSpecifier: (node: ESTree.ImportSpecifier & Rule.NodeParentExtension) => {
      //   console.log('ImportDeclaration node.source.value: ', node.source.value)
      // }
      // onCodePathStart: (codePath: Rule.CodePath, node: Rule.Node) => {

      // }
    }
    return listeners
  }
}

// @ts-ignore
// ignoring this rule because we use tsconfig.rules.json which is outputting cjs, not esm
export = esmExtensionsRule
