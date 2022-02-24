/* eslint-disable no-console */

import clientTests from './isomorphic-tests/client'
import configurationTests from './isomorphic-tests/configuration'
import fetch from 'node-fetch'

const setup = async () => {
  return await new Promise<void>((resolve, reject) => {
    void resolve()
  })
}
// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe('node', async (): Promise<void> => {
  console.log(fetch)
  await configurationTests(setup)
  await clientTests(setup)
})

// const getClientConfigForMockServer = (mockServer: MockServer) => new Configuration({
//   basePath: mockServer.basePath,
//   fetchApi: fetch as GlobalFetch['fetch'],
//   accessToken: process.env.MOCK_PINNING_SERVER_SECRET
// })
