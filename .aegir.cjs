require('ts-node').register({
  project: 'tsconfig.json',
})

// const { MockServerController } = require('./test/MockServerController')

// import {register} from 'ts-node'
// register({
//   project: 'tsconfig.json',
// })
// const { MockServerController } = require('./test/MockServerController')
// import {MockServerController} from './test/MockServerController.js'

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
      const controller = new (await import('./test/MockServerController')).MockServerController()
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
