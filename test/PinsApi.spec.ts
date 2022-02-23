
import { expect } from 'aegir/utils/chai'
import fetch from 'node-fetch'

import { PinsApi, Configuration, ConfigurationParameters, Pin, Status } from '../src'
import { MockServer } from './MockServer'

import('dotenvrc')

const getClientConfigForMockServer = (mockServer: MockServer) => new Configuration({
  basePath: mockServer.basePath,
  fetchApi: fetch as GlobalFetch['fetch'],
  accessToken: process.env.MOCK_PINNING_SERVER_SECRET
})

describe('PinsApi', () => {
  describe('Configuration', () => {
    it('Can be instantiated', () => {
      const configuration: ConfigurationParameters = {}
      expect(() => new Configuration(configuration)).not.to.throw()
    })
  })
  describe('Client', () => {
    const Config = new Configuration({
      basePath: `http://127.0.0.1:${process.env.MOCK_PINNING_SERVER_PORT ?? '3000'}`,
      fetchApi: fetch as GlobalFetch['fetch'],
      accessToken: process.env.MOCK_PINNING_SERVER_SECRET
    })

    it('Can be instantiated', () => {
      expect(() => new PinsApi(Config)).not.to.throw()
    })

    describe('Operations', () => {
      let mockServer: MockServer
      beforeEach(async () => {
        mockServer = new MockServer()
        await mockServer.start()
      })

      afterEach(async () => {
        await mockServer.stop()
      })

      it('GET: Can get failed Pins', async () => {
        const Client = new PinsApi(getClientConfigForMockServer(mockServer))
        const response = await Client.pinsGet({ limit: 1, status: new Set([Status.Failed]) })
        expect(response).to.deep.eq({ count: 0, results: new Set() })
      })

      it('GET: Can add a Pin successfully', async () => {
        const Client = new PinsApi(getClientConfigForMockServer(mockServer))
        const pin: Pin = {
          cid: 'abc123',
          name: 'pinned-test1'
        }
        const response = await Client.pinsPost({ pin })
        expect(response).to.deep.includes({ status: Status.Pinned })
        expect(response.pin).to.deep.include({ ...pin })
      })

      it('POST: Can handle a failed pinning', async () => {
        const Client = new PinsApi(getClientConfigForMockServer(mockServer))
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
})
