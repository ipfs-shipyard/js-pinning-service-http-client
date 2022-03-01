// import { MockServer } from './test/MockServer'

// let mockServer = new MockServer()
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
      return new MockServerController()
    },
    /**
     *
     * @param {GlobalOptions & TestOptions} _
     * @param {MockServerController} controller
     */
    async after (_, controller) {
      console.log('test after:')
      await controller.shutdown()

    }
  }
}
