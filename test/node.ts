/* eslint-disable no-console */

import clientTests from './isomorphic-tests/client'
// import configurationTests from './configuration.spec'
// import mockServerControllerTests from './node-tests'
import fetchPonyfill from 'fetch-ponyfill'

const setup = async () => {
  const { fetch } = fetchPonyfill()

  return {
    fetch: fetch as GlobalFetch['fetch']
  }
  // return await new Promise<{fetch: GlobalFetch['fetch']}>((resolve, reject) => {
  //   void resolve({
  //     fetch:
  //   })
  // })
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe('node', async (): Promise<void> => {
  // await mockServerControllerTests(setup)
  // await configurationTests(setup)
  await clientTests(setup)
})

// const getClientConfigForMockServer = (mockServer: MockServer) => new Configuration({
//   basePath: mockServer.basePath,
//   fetchApi: fetch as GlobalFetch['fetch'],
//   accessToken: process.env.MOCK_PINNING_SERVER_SECRET
// })
