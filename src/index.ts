import fetchPonyfill from 'fetch-ponyfill'

import { Configuration as GeneratedConfiguration } from 'generated/index.js'
// eslint-disable-next-line import/no-duplicates
import type { ConfigurationParameters as GeneratedConfigurationParameters } from 'generated/index.js'
import { PinsApi as RemotePinningServiceClient } from 'generated/apis/index.js'

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
} from 'generated/apis'

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
} from 'generated/apis'

export * from 'generated/models'

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
} from 'generated/runtime'

export type {
  FetchParams,
  RequestOpts,
  Consume,
  RequestContext,
  ResponseContext,
  Middleware,
  ApiResponse,
  ResponseTransformer
} from 'generated/runtime'
