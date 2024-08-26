
/** @type {import('aegir').PartialOptions} */
export default {
  typescript: true,
  dependencyCheck: {
    ignore: [
      '@swc/cli',
      '@swc/core',
      '@swc/helpers',
      'cors',
      'dotenvrc',
      'express',
      'express-promise-router',
      'mock-ipfs-pinning-service',
      'portscanner',
      'regenerator-runtime',
      'winston',
    ]
  },
  docs: {
    publish: true,
    entryPoint: './'
  },
  build: {
    types: true,
    config: {
      format: 'esm',
      platform: 'node',
      external: ['electron', '#ansi-styles', 'yargs/yargs', '#supports-color']
    },
    bundlesizeMax: '44KB'
  },
  test: {
    build: false,
    progress: true,
    cov: false,
    async before () {
      const { MockServerController } = await import('./dist/test/MockServerController.js')
      return {
        env: {
          MOCK_PINNING_SERVER_SECRET: 'ci',
        },
        controller: new MockServerController(),
      }
    },
    /**
     * @param {import('aegir').GlobalOptions & import('aegir').TestOptions} _
     * @param { { controller: import('./test/MockServerController.js').MockServerController } } beforeResult
     */
    async after (_, {controller}) {
      await controller.shutdown()
    }
  }
}
