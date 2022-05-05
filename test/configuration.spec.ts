/* eslint-env browser, node, mocha */

import { expect } from 'aegir/chai'
import { Configuration, ConfigurationParameters } from '../src'

// export default async (setup: () => Promise<unknown>) => {
describe('Configuration', () => {
  it('Can be instantiated', () => {
    const configuration: ConfigurationParameters = {}
    expect(() => new Configuration(configuration)).not.to.throw()
  })
})
// }
