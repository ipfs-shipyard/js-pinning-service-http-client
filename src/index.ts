import fetchPonyfill from 'fetch-ponyfill'
import { Configuration as GeneratedConfiguration, ConfigurationParameters } from '../generated/fetch/src/index'

class Configuration extends GeneratedConfiguration {
  constructor (options: ConfigurationParameters) {
    /**
     * Prevent the need for everyone to have to override the fetch API...
     */
    if (options.fetchApi == null) {
      options.fetchApi = fetchPonyfill().fetch
    }
    super(options)
  }
}

export * from '../generated/fetch/src/index'
export { Configuration }
