import fetchPonyfill from 'fetch-ponyfill'
import { Configuration as GeneratedConfiguration } from '../dist.generated'
import type { ConfigurationParameters } from '../dist.generated'

export * from '../dist.generated/apis'
export * from '../dist.generated/models'

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
} from '../dist.generated/runtime'
