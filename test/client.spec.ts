/* eslint-env browser, node, mocha */
import fetchPonyfill from 'fetch-ponyfill'

import { expect } from 'aegir/chai'

import { Configuration, RemotePinningServiceClient, Status } from '../src/index.js'
import type { Pin } from '../src/index.js'

const { fetch } = fetchPonyfill()

let Config = new Configuration({
  endpointUrl: 'http://127.0.0.1:3000',
  accessToken: process.env.MOCK_PINNING_SERVER_SECRET
})

describe('Client', () => {
  it('Can be instantiated', () => {
    expect(() => new RemotePinningServiceClient(Config)).not.to.throw()
  })

  describe('Operations', () => {
    beforeEach(async () => {
      const response = await fetch('http://localhost:3000/start')
      const { endpointUrl, accessToken } = await response.json()
      Config = new Configuration({
        endpointUrl,
        accessToken
      })
    })

    afterEach(async () => {
      const basePathParts = Config.basePath.split(':')
      // explicitly set port as string because '@typescript-eslint/restrict-template-expressions' is broken.
      const port: string = basePathParts[2]
      const response = await fetch(`http://localhost:3000/stop/${port}`)

      const { success } = await response.json()

      if (success === false) {
        throw new Error(`Unexpected error when attempting to stop the mockServer on port ${port}`)
      }
    })

    it('GET: Can get failed Pins', async () => {
      const Client = new RemotePinningServiceClient(Config)
      const response = await Client.pinsGet({ limit: 1, status: new Set([Status.Failed]) })
      expect(response).to.deep.eq({ count: 0, results: new Set() })
    })

    it('GET: Can add a Pin successfully', async () => {
      const Client = new RemotePinningServiceClient(Config)
      const pin: Pin = {
        cid: 'abc123',
        name: 'pinned-test1'
      }
      const response = await Client.pinsPost({ pin })
      expect(response).to.deep.includes({ status: Status.Pinned })
      expect(response.pin).to.deep.include({ ...pin })
    })

    it('POST: Can handle a failed pinning', async () => {
      const Client = new RemotePinningServiceClient(Config)
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
