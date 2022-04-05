import fetchPonyfill from 'fetch-ponyfill'

import { Configuration as GeneratedConfiguration } from '../dist.generated'
import type { ConfigurationParameters as GeneratedConfigurationParameters } from '../dist.generated'
import { PinsApi as RemotePinningServiceClient } from '../dist.generated/apis'

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
} from '../dist.generated/apis'

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
} from '../dist.generated/apis'

export * from '../dist.generated/models'

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

export type {
  FetchParams,
  RequestOpts,
  Consume,
  RequestContext,
  ResponseContext,
  Middleware,
  ApiResponse,
  ResponseTransformer
} from '../dist.generated/runtime'
