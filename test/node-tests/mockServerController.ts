import { MockServerController } from '../MockServerController'

import fetchPonyfill from 'fetch-ponyfill'
import { expect } from 'aegir/utils/chai'

const { fetch } = fetchPonyfill()

export default async (setup: () => Promise<unknown>) => {
  describe.skip('MockServerController', () => {
    it('can start and stop without errors', async () => {
      expect(async () => {
        const controller = new MockServerController()
        await controller.shutdown()
      }).not.to.throw()
    })

    it('Can start multiple mockServers', async () => {
      const controller = new MockServerController()
      const serverConfigs: Array<{basePath: string}> = []

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of Array(5)) {
        const response = await fetch('http://localhost:3000/start')
        serverConfigs.push(await response.json())
      }
      // it('Can shutdown those mockServers', async () => {
      for await (const config of serverConfigs) {
        const { basePath } = config
        const [,, port] = basePath

        const response = await fetch(`http://localhost:3000/stop/${port}`)

        const { success } = await response.json()
        expect(success).to.equal(true)
      }
      // })

      await controller.shutdown()
    })
  })
}
