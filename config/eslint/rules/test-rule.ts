/* eslint-disable no-console */
import type { Rule } from 'eslint'
import type ESTree from 'estree'

const testRule: Rule.RuleModule = {
  create: (context: Rule.RuleContext) => {
    console.log('test')
    const returnValue: Rule.RuleListener = {
      ImportDeclaration: (node: ESTree.ImportDeclaration & Rule.NodeParentExtension) => {
        console.log('ImportDeclaration node.source.value: ', node.source.value)
        context.report({
          message: `ImportDeclaration node.source.value:  ${node.source.value as string}`,
          node
        })
      }
      // ImportDefaultSpecifier: (node: ESTree.ImportDefaultSpecifier & Rule.NodeParentExtension) => {
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

export { testRule }
