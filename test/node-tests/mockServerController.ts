import { expect } from 'aegir/chai'
import { MockServerController } from '../MockServerController.js'

export default async (setup: () => Promise<unknown>): Promise<void> => {
  describe.skip('MockServerController', () => {
    it('can start and stop without errors', async () => {
      expect(async () => {
        const controller = new MockServerController()
        await controller.shutdown()
      }).not.to.throw()
    })

    it('Can start multiple mockServers', async () => {
      const controller = new MockServerController()
      const serverConfigs: Array<{ basePath: string }> = []

      await Promise.all(Array(5).fill(0).map(async () => {
        const response = await fetch('http://localhost:3000/start')
        serverConfigs.push(await response.json())
      }))

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
