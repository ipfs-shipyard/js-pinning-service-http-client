require('ts-node').register({
  project: 'tsconfig.json',
})

const { MockServerController } = require('./test/MockServerController')


/** @type {import('aegir').PartialOptions} */
module.exports = {
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
      return {
        env: {
          MOCK_PINNING_SERVER_SECRET: 'ci',
        },
        controller: new MockServerController(),
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
