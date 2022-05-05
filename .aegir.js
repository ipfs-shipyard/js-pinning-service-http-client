import { MockServerController } from './dist/test/MockServerController.js'
import {logger} from './dist/test/logger.js'

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
      logger.info('.aegir.js: inside before function')
      const controller = new MockServerController()

      logger.info(`.aegir.js:before(): controller.server.getMaxListeners() = ${controller.server.getMaxListeners()}`)
      return {
        env: {
          MOCK_PINNING_SERVER_SECRET: 'ci',
        },
        controller,
      }
    },
    /**
     * @param {import('aegir').GlobalOptions & import('aegir').TestOptions} _
     * @param { {controller: MockServerController} } beforeResult
     */
    async after (_, {controller}) {
      logger.info('.aegir.js: inside after function')
      await controller.shutdown()
    }
  }
}
