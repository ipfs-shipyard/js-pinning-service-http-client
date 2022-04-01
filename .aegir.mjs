/** @type {import('aegir').PartialOptions} */
export default {
  docs: {
    publish: true,
    entryPoint: './'
  },
  tsRepo: true,
  build: {
    config: {
      platform: 'node'
    },
    bundlesizeMax: '44KB'
  },
  test: {
    cov: false,
    async before () {
      const controller = new (await import('./dist/test/MockServerController')).MockServerController()
      return {
        env: {
          MOCK_PINNING_SERVER_SECRET: 'ci',
        },
        controller,
      }
    },
    /**
     *
     * @param {GlobalOptions & TestOptions} _
     * @param {MockServerController} controller
     */
    async after (_, {controller}) {
      await controller.shutdown()
    }
  }
}
