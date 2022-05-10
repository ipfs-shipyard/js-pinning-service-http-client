import { MockServerController } from './dist/test/MockServerController.js'

/** @type {import('aegir').PartialOptions} */
const config = {
  docs: {
    publish: true,
    entryPoint: './'
  },
  build: {
    config: {
      platform: 'node'
    },
    bundlesizeMax: '44KB'
  },
  test: {
    build: false,
    progress: true,
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
     * @param {import('aegir').GlobalOptions & import('aegir').TestOptions} _
     * @param { {controller: MockServerController} } beforeResult
     */
    async after (_, {controller}) {
      await controller.shutdown()
    }
  }
}

export default config
