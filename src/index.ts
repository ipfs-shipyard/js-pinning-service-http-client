import fetchPonyfill from 'fetch-ponyfill'
import { Configuration as GeneratedConfiguration } from '../generated/fetch/dist/src'
import type { ConfigurationParameters } from '../generated/fetch/dist/src'

export * from '../generated/fetch/dist/src/apis'
export * from '../generated/fetch/dist/src/models'

export class Configuration extends GeneratedConfiguration {
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

export type { ConfigurationParameters }
export {
  BASE_PATH,
  BaseAPI,
  BlobApiResponse,
  COLLECTION_FORMATS,
  // Configuration, // overwritten above
  JSONApiResponse,
  RequiredError,
  TextApiResponse,
  VoidApiResponse,
  canConsumeForm,
  exists,
  mapValues,
  querystring
} from '../generated/fetch/dist/src/runtime'
