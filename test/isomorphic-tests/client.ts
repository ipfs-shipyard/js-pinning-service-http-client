/* eslint-env browser, node, mocha */

import { expect } from 'aegir/utils/chai'
import { Configuration, PinsApi, Status } from '../../src'
import type { Pin } from '../../src'

export default async (setup: () => Promise<{fetch: GlobalFetch['fetch']}>) => {
  const { fetch } = await setup()
  let Config = new Configuration({
    basePath: `http://127.0.0.1:${process.env.MOCK_PINNING_SERVER_PORT ?? '3000'}`,
    fetchApi: fetch,
    accessToken: process.env.MOCK_PINNING_SERVER_SECRET
  })
  describe('Client', () => {
    it('Can be instantiated', () => {
      expect(() => new PinsApi(Config)).not.to.throw()
    })

    describe('Operations', () => {
      // let mockServer: MockServer
      // let Config: Configuration
      beforeEach(async () => {
        const response = await fetch('http://localhost:3000/start')
        const { basePath, accessToken } = await response.json()
        Config = new Configuration({
          basePath,
          accessToken,
          fetchApi: fetch
        })
      })

      afterEach(async () => {
        const [,,port] = Config.basePath.split(':')
        const response = await fetch(`http://localhost:3000/stop/${port}`)

        const { success } = await response.json()

        if (success === false) {
          throw new Error(`Unexpected error when attempting to stop the mockServer on port ${port}`)
        }
      })

      it('GET: Can get failed Pins', async () => {
        const Client = new PinsApi(Config)
        const response = await Client.pinsGet({ limit: 1, status: new Set([Status.Failed]) })
        expect(response).to.deep.eq({ count: 0, results: new Set() })
      })

      it('GET: Can add a Pin successfully', async () => {
        const Client = new PinsApi(Config)
        const pin: Pin = {
          cid: 'abc123',
          name: 'pinned-test1'
        }
        const response = await Client.pinsPost({ pin })
        expect(response).to.deep.includes({ status: Status.Pinned })
        expect(response.pin).to.deep.include({ ...pin })
      })

      it('POST: Can handle a failed pinning', async () => {
        const Client = new PinsApi(Config)
        const pin: Pin = {
          cid: 'abc123',
          name: 'failed-test2'
        }
        const response = await Client.pinsPost({ pin })
        expect(response).to.deep.includes({ status: Status.Failed })
        expect(response.pin).to.deep.include({ ...pin })
      })
    })
  })
}
