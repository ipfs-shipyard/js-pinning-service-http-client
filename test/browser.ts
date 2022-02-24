/* eslint-disable no-console */

import clientTests from './isomorphic-tests/client'
import configurationTests from './isomorphic-tests/configuration'



const setup = async () => {
  return await new Promise<void>((resolve, reject) => {
    void resolve()
  })
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe('browser', async (): Promise<void> => {
  console.log(fetch)
  await configurationTests(setup)
  await clientTests(setup)
})
