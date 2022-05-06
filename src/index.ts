/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * Simple spacing while doing screen recording.
 */
import fetchPonyfill from 'fetch-ponyfill'

import { Configuration as GeneratedConfiguration } from '../dist.generated/index.js' // <-- Note the lack of extension prior to running eslint fix.
import type { ConfigurationParameters as GeneratedConfigurationParameters } from '../dist.generated/index.js' // <-- Note the lack of extension prior to running eslint fix.
import { PinsApi as RemotePinningServiceClient } from '../dist.generated/apis/index.js' // <-- Note the lack of extension prior to running eslint fix.

const foo = require('./test123')
interface ConfigurationParameters extends Omit<GeneratedConfigurationParameters, 'basePath'>{
  endpointUrl?: string
}
class Configuration extends GeneratedConfiguration {
  constructor (options: ConfigurationParameters) {
    const finalOptions: GeneratedConfigurationParameters = { ...options }
    /**
     * Prevent the need for everyone to have to override the fetch API...
     */
    if (options.fetchApi == null) {
      finalOptions.fetchApi = fetchPonyfill().fetch
    }

    // @see https://github.com/ipfs-shipyard/js-pinning-service-http-client/issues/3
    if (options.endpointUrl != null) {
      finalOptions.basePath = options.endpointUrl
    }

    super(finalOptions)
  }
}

/**
 * Overwritten and renamed exports
 */
export type {
  PinsApiInterface as RemotePinningServiceClientInterface
} from '../dist.generated/apis/index.js'

export {
  Configuration,
  RemotePinningServiceClient
}
export type { ConfigurationParameters }

/**
 * Unmodified exports
 */
export type {
  PinsGetRequest,
  PinsPostRequest,
  PinsRequestidDeleteRequest,
  PinsRequestidGetRequest,
  PinsRequestidPostRequest
} from '../dist.generated/apis/index.js'

export * from '../dist.generated/models/index.js'

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
} from '../dist.generated/runtime.js'

export type {
  FetchParams,
  RequestOpts,
  Consume,
  RequestContext,
  ResponseContext,
  Middleware,
  ApiResponse,
  ResponseTransformer
} from '../dist.generated/runtime.js'
