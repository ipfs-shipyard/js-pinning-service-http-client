/* eslint-env browser, node, mocha */
import { expect } from 'aegir/chai'

import { Configuration, type ConfigurationParameters } from '../src/index.js'

describe('Configuration', () => {
  it('Can be instantiated', () => {
    const configuration: ConfigurationParameters = {}
    expect(() => new Configuration(configuration)).not.to.throw()
  })
})
