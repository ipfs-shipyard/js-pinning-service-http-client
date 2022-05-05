import { MockServerController } from './dist.test/test/MockServerController.js'

/** @type {import('aegir').PartialOptions} */
export const config = {
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
