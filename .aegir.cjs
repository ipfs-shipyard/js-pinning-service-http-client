// import { MockServer } from './test/MockServer'

// let mockServer = new MockServer()
require('ts-node').register({
  project: 'tsconfig.json',
})
const { MockServer } = require('./test/MockServer')

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
    async before () {

    },
    async beforeEach () {

      // mockServer = new MockServer()
      await mockServer.start()
    },
    async afterEach () {

        await mockServer.stop()
    },
    async after () {

    }
  }
}
