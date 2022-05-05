/* eslint-disable no-console */
import type { Rule } from 'eslint'
import type {ImportDeclaration, ExportAllDeclaration, ImportSpecifier} from 'estree'

declare module 'estree' {
  interface ImportDeclaration {
    importKind: string
  }
}

const esmExtensionsRule: Rule.RuleModule = {
  meta: {

  },
  create: (context: Rule.RuleContext) => {
    console.log('test')
    const sourceCode = context.getSourceCode();

    const returnValue: Rule.RuleListener = {
      // ImportDeclaration: (node: ESTree.ImportDeclaration & Rule.NodeParentExtension) => {
      //   console.log('ImportDeclaration node.source.value: ', node.source.value)
      //   context.report({
      //     message: `ImportDeclaration node.source.value:  ${node.source.value as string}`,
      //     node
      //   })
      // },
      ExportDeclaration: function (node: ExportAllDeclaration & Rule.NodeParentExtension) {

        },
        ImportDeclaration: function (node: ImportDeclaration & Rule.NodeParentExtension) {
          // console.log(`sourceCode.getText(node): `, sourceCode.getText(node));

          console.log(`node.importKind: `, node.importKind);
          const importedPath = node.source.value
          if (typeof importedPath === 'string' && importedPath[0] !== '.') {
            console.log(`importedPath of '${importedPath}' is not relative, aborting rule early.`)
            return
          }
          const nodeSource = sourceCode.getText(node)
          node.specifiers.forEach((specifier) => {
            console.log(`specifier.type: `, specifier.type);

            if ((specifier as ImportSpecifier).imported !== null) {

              const importedObjectName = (specifier as ImportSpecifier).imported?.name
              const localObjectName = specifier.local?.name
              if (importedObjectName == null || localObjectName == null) {
                console.log('importedObjectName is undefined, check out the specifier', specifier)
              } else {
                const wasRenamed = localObjectName && localObjectName !== localObjectName
                console.log(`was ${importedObjectName} renamed to ${localObjectName} ?: ${wasRenamed ? 'yes' : 'no'}!`)
              }
            }
          })
          // console.log('ImportDeclaration node', node)
          // console.log('ImportDeclaration node.parent.body', node.parent.body)
          // console.log('ImportDeclaration node.specifiers', node.specifiers)
            // console.log('ImportDeclaration node.source.value: ', node.source.value);
            context.report({
                message: "ImportDeclaration source:  ".concat(nodeSource),
                node: node
            });
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
    return returnValue
  }
}

export = esmExtensionsRule
