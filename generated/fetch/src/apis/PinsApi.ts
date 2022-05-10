/* tslint:disable */
/* eslint-disable */
/**
 * IPFS Pinning Service API
 *   ## About this spec The IPFS Pinning Service API is intended to be an implementation-agnostic API&#x3a; - For use and implementation by pinning service providers - For use in client mode by IPFS nodes and GUI-based applications  > **Note**: while ready for implementation, this spec is still a work in progress! 🏗️  **Your input and feedback are welcome and valuable as we develop this API spec. Please join the design discussion at [github.com/ipfs/pinning-services-api-spec](https://github.com/ipfs/pinning-services-api-spec).**  # Schemas This section describes the most important object types and conventions.  A full list of fields and schemas can be found in the `schemas` section of the [YAML file](https://github.com/ipfs/pinning-services-api-spec/blob/master/ipfs-pinning-service.yaml).  ## Identifiers ### cid [Content Identifier (CID)](https://docs.ipfs.io/concepts/content-addressing/) points at the root of a DAG that is pinned recursively. ### requestid Unique identifier of a pin request.  When a pin is created, the service responds with unique `requestid` that can be later used for pin removal. When the same `cid` is pinned again, a different `requestid` is returned to differentiate between those pin requests.  Service implementation should use UUID, `hash(accessToken,Pin,PinStatus.created)`, or any other opaque identifier that provides equally strong protection against race conditions.  ## Objects ### Pin object  ![pin object](https://bafybeideck2fchyxna4wqwc2mo67yriokehw3yujboc5redjdaajrk2fjq.ipfs.dweb.link/pin.png)  The `Pin` object is a representation of a pin request.  It includes the `cid` of data to be pinned, as well as optional metadata in `name`, `origins`, and `meta`.  ### Pin status response  ![pin status response object](https://bafybeideck2fchyxna4wqwc2mo67yriokehw3yujboc5redjdaajrk2fjq.ipfs.dweb.link/pinstatus.png)  The `PinStatus` object is a representation of the current state of a pinning operation. It includes the original `pin` object, along with the current `status` and globally unique `requestid` of the entire pinning request, which can be used for future status checks and management. Addresses in the `delegates` array are peers delegated by the pinning service for facilitating direct file transfers (more details in the provider hints section). Any additional vendor-specific information is returned in optional `info`.  # The pin lifecycle  ![pinning service objects and lifecycle](https://bafybeideck2fchyxna4wqwc2mo67yriokehw3yujboc5redjdaajrk2fjq.ipfs.dweb.link/lifecycle.png)  ## Creating a new pin object The user sends a `Pin` object to `POST /pins` and receives a `PinStatus` response: - `requestid` in `PinStatus` is the identifier of the pin operation, which can can be used for checking status, and removing the pin in the future - `status` in `PinStatus` indicates the current state of a pin  ## Checking status of in-progress pinning `status` (in `PinStatus`) may indicate a pending state (`queued` or `pinning`). This means the data behind `Pin.cid` was not found on the pinning service and is being fetched from the IPFS network at large, which may take time.  In this case, the user can periodically check pinning progress via `GET /pins/{requestid}` until pinning is successful, or the user decides to remove the pending pin.  ## Replacing an existing pin object The user can replace an existing pin object via `POST /pins/{requestid}`. This is a shortcut for removing a pin object identified by `requestid` and creating a new one in a single API call that protects against undesired garbage collection of blocks common to both pins. Useful when updating a pin representing a huge dataset where most of blocks did not change. The new pin object `requestid` is returned in the `PinStatus` response. The old pin object is deleted automatically.  ## Removing a pin object A pin object can be removed via `DELETE /pins/{requestid}`.   # Provider hints A pinning service will use the DHT and other discovery methods to locate pinned content; however, it is a good practice to provide additional provider hints to speed up the discovery phase and start the transfer immediately, especially if a client has the data in their own datastore or already knows of other providers.  The most common scenario is a client putting its own IPFS node\'s multiaddrs in `Pin.origins`,  and then attempt to connect to every multiaddr returned by a pinning service in `PinStatus.delegates` to initiate transfer.  At the same time, a pinning service will try to connect to multiaddrs provided by the client in `Pin.origins`.  This ensures data transfer starts immediately (without waiting for provider discovery over DHT), and mutual direct dial between a client and a service works around peer routing issues in restrictive network topologies, such as NATs, firewalls, etc.  **NOTE:** Connections to multiaddrs in `origins` and `delegates` arrays should be attempted in best-effort fashion, and dial failure should not fail the pinning operation. When unable to act on explicit provider hints, DHT and other discovery methods should be used as a fallback by a pinning service.  **NOTE:** All multiaddrs MUST end with `/p2p/{peerID}` and SHOULD be fully resolved and confirmed to be dialable from the public internet. Avoid sending addresses from local networks.  # Custom metadata Pinning services are encouraged to add support for additional features by leveraging the optional `Pin.meta` and `PinStatus.info` fields. While these attributes can be application- or vendor-specific, we encourage the community at large to leverage these attributes as a sandbox to come up with conventions that could become part of future revisions of this API. ## Pin metadata String keys and values passed in `Pin.meta` are persisted with the pin object.  Potential uses: - `Pin.meta[app_id]`: Attaching a unique identifier to pins created by an app enables filtering pins per app via `?meta={\"app_id\":<UUID>}` - `Pin.meta[vendor_policy]`: Vendor-specific policy (for example: which region to use, how many copies to keep)  Note that it is OK for a client to omit or ignore these optional attributes; doing so should not impact the basic pinning functionality.  ## Pin status info Additional `PinStatus.info` can be returned by pinning service.  Potential uses: - `PinStatus.info[status_details]`: more info about the current status (queue position, percentage of transferred data, summary of where data is stored, etc); when `PinStatus.status=failed`, it could provide a reason why a pin operation failed (e.g. lack of funds, DAG too big, etc.) - `PinStatus.info[dag_size]`: the size of pinned data, along with DAG overhead - `PinStatus.info[raw_size]`: the size of data without DAG overhead (eg. unixfs) - `PinStatus.info[pinned_until]`: if vendor supports time-bound pins, this could indicate when the pin will expire  # Pagination and filtering Pin objects can be listed by executing `GET /pins` with optional parameters:  - When no filters are provided, the endpoint will return a small batch of the 10 most recently created items, from the latest to the oldest. - The number of returned items can be adjusted with the `limit` parameter (implicit default is 10). - If the value in `PinResults.count` is bigger than the length of `PinResults.results`, the client can infer there are more results that can be queried. - To read more items, pass the `before` filter with the timestamp from `PinStatus.created` found in the oldest item in the current batch of results. Repeat to read all results. - Returned results can be fine-tuned by applying optional `after`, `cid`, `name`, `status`, or `meta` filters.  > **Note**: pagination by the `created` timestamp requires each value to be globally unique. Any future considerations to add support for bulk creation must account for this.  
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime.js';
import {
    Failure,
    FailureFromJSON,
    FailureToJSON,
    Pin,
    PinFromJSON,
    PinToJSON,
    PinResults,
    PinResultsFromJSON,
    PinResultsToJSON,
    PinStatus,
    PinStatusFromJSON,
    PinStatusToJSON,
    Status,
    StatusFromJSON,
    StatusToJSON,
    TextMatchingStrategy,
    TextMatchingStrategyFromJSON,
    TextMatchingStrategyToJSON,
} from '../models/index.js';

export interface PinsGetRequest {
    cid?: Set<string>;
    name?: string;
    match?: TextMatchingStrategy;
    status?: Set<Status>;
    before?: Date;
    after?: Date;
    limit?: number;
    meta?: { [key: string]: string; };
}

export interface PinsPostRequest {
    pin: Pin;
}

export interface PinsRequestidDeleteRequest {
    requestid: string;
}

export interface PinsRequestidGetRequest {
    requestid: string;
}

export interface PinsRequestidPostRequest {
    requestid: string;
    pin: Pin;
}

/**
 * PinsApi - interface
 * 
 * @export
 * @interface PinsApiInterface
 */
export interface PinsApiInterface {
    /**
     * List all the pin objects, matching optional filters; when no filter is provided, only successful pins are returned
     * @summary List pin objects
     * @param {Set<string>} [cid] Return pin objects responsible for pinning the specified CID(s); be aware that using longer hash functions introduces further constraints on the number of CIDs that will fit under the limit of 2000 characters per URL  in browser contexts
     * @param {string} [name] Return pin objects with specified name (by default a case-sensitive, exact match)
     * @param {TextMatchingStrategy} [match] Customize the text matching strategy applied when name filter is present
     * @param {Set<Status>} [status] Return pin objects for pins with the specified status
     * @param {Date} [before] Return results created (queued) before provided timestamp
     * @param {Date} [after] Return results created (queued) after provided timestamp
     * @param {number} [limit] Max records to return
     * @param {{ [key: string]: string; }} [meta] Return pin objects that match specified metadata
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PinsApiInterface
     */
    pinsGetRaw(requestParameters: PinsGetRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<PinResults>>;

    /**
     * List all the pin objects, matching optional filters; when no filter is provided, only successful pins are returned
     * List pin objects
     */
    pinsGet(requestParameters: PinsGetRequest, initOverrides?: RequestInit): Promise<PinResults>;

    /**
     * Add a new pin object for the current access token
     * @summary Add pin object
     * @param {Pin} pin 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PinsApiInterface
     */
    pinsPostRaw(requestParameters: PinsPostRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<PinStatus>>;

    /**
     * Add a new pin object for the current access token
     * Add pin object
     */
    pinsPost(requestParameters: PinsPostRequest, initOverrides?: RequestInit): Promise<PinStatus>;

    /**
     * Remove a pin object
     * @summary Remove pin object
     * @param {string} requestid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PinsApiInterface
     */
    pinsRequestidDeleteRaw(requestParameters: PinsRequestidDeleteRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<void>>;

    /**
     * Remove a pin object
     * Remove pin object
     */
    pinsRequestidDelete(requestParameters: PinsRequestidDeleteRequest, initOverrides?: RequestInit): Promise<void>;

    /**
     * Get a pin object and its status
     * @summary Get pin object
     * @param {string} requestid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PinsApiInterface
     */
    pinsRequestidGetRaw(requestParameters: PinsRequestidGetRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<PinStatus>>;

    /**
     * Get a pin object and its status
     * Get pin object
     */
    pinsRequestidGet(requestParameters: PinsRequestidGetRequest, initOverrides?: RequestInit): Promise<PinStatus>;

    /**
     * Replace an existing pin object (shortcut for executing remove and add operations in one step to avoid unnecessary garbage collection of blocks present in both recursive pins)
     * @summary Replace pin object
     * @param {string} requestid 
     * @param {Pin} pin 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PinsApiInterface
     */
    pinsRequestidPostRaw(requestParameters: PinsRequestidPostRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<PinStatus>>;

    /**
     * Replace an existing pin object (shortcut for executing remove and add operations in one step to avoid unnecessary garbage collection of blocks present in both recursive pins)
     * Replace pin object
     */
    pinsRequestidPost(requestParameters: PinsRequestidPostRequest, initOverrides?: RequestInit): Promise<PinStatus>;

}

/**
 * 
 */
export class PinsApi extends runtime.BaseAPI implements PinsApiInterface {

    /**
     * List all the pin objects, matching optional filters; when no filter is provided, only successful pins are returned
     * List pin objects
     */
    async pinsGetRaw(requestParameters: PinsGetRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<PinResults>> {
        const queryParameters: any = {};

        if (requestParameters.cid) {
            queryParameters['cid'] = Array.from(requestParameters.cid).join(runtime.COLLECTION_FORMATS["csv"]);
        }

        if (requestParameters.name !== undefined) {
            queryParameters['name'] = requestParameters.name;
        }

        if (requestParameters.match !== undefined) {
            queryParameters['match'] = requestParameters.match;
        }

        if (requestParameters.status) {
            queryParameters['status'] = Array.from(requestParameters.status).join(runtime.COLLECTION_FORMATS["csv"]);
        }

        if (requestParameters.before !== undefined) {
            queryParameters['before'] = (requestParameters.before as any).toISOString();
        }

        if (requestParameters.after !== undefined) {
            queryParameters['after'] = (requestParameters.after as any).toISOString();
        }

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        if (requestParameters.meta !== undefined) {
            queryParameters['meta'] = requestParameters.meta;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("accessToken", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/pins`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PinResultsFromJSON(jsonValue));
    }

    /**
     * List all the pin objects, matching optional filters; when no filter is provided, only successful pins are returned
     * List pin objects
     */
    async pinsGet(requestParameters: PinsGetRequest = {}, initOverrides?: RequestInit): Promise<PinResults> {
        const response = await this.pinsGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Add a new pin object for the current access token
     * Add pin object
     */
    async pinsPostRaw(requestParameters: PinsPostRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<PinStatus>> {
        if (requestParameters.pin === null || requestParameters.pin === undefined) {
            throw new runtime.RequiredError('pin','Required parameter requestParameters.pin was null or undefined when calling pinsPost.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("accessToken", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/pins`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: PinToJSON(requestParameters.pin),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PinStatusFromJSON(jsonValue));
    }

    /**
     * Add a new pin object for the current access token
     * Add pin object
     */
    async pinsPost(requestParameters: PinsPostRequest, initOverrides?: RequestInit): Promise<PinStatus> {
        const response = await this.pinsPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Remove a pin object
     * Remove pin object
     */
    async pinsRequestidDeleteRaw(requestParameters: PinsRequestidDeleteRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.requestid === null || requestParameters.requestid === undefined) {
            throw new runtime.RequiredError('requestid','Required parameter requestParameters.requestid was null or undefined when calling pinsRequestidDelete.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("accessToken", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/pins/{requestid}`.replace(`{${"requestid"}}`, encodeURIComponent(String(requestParameters.requestid))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Remove a pin object
     * Remove pin object
     */
    async pinsRequestidDelete(requestParameters: PinsRequestidDeleteRequest, initOverrides?: RequestInit): Promise<void> {
        await this.pinsRequestidDeleteRaw(requestParameters, initOverrides);
    }

    /**
     * Get a pin object and its status
     * Get pin object
     */
    async pinsRequestidGetRaw(requestParameters: PinsRequestidGetRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<PinStatus>> {
        if (requestParameters.requestid === null || requestParameters.requestid === undefined) {
            throw new runtime.RequiredError('requestid','Required parameter requestParameters.requestid was null or undefined when calling pinsRequestidGet.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("accessToken", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/pins/{requestid}`.replace(`{${"requestid"}}`, encodeURIComponent(String(requestParameters.requestid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PinStatusFromJSON(jsonValue));
    }

    /**
     * Get a pin object and its status
     * Get pin object
     */
    async pinsRequestidGet(requestParameters: PinsRequestidGetRequest, initOverrides?: RequestInit): Promise<PinStatus> {
        const response = await this.pinsRequestidGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Replace an existing pin object (shortcut for executing remove and add operations in one step to avoid unnecessary garbage collection of blocks present in both recursive pins)
     * Replace pin object
     */
    async pinsRequestidPostRaw(requestParameters: PinsRequestidPostRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<PinStatus>> {
        if (requestParameters.requestid === null || requestParameters.requestid === undefined) {
            throw new runtime.RequiredError('requestid','Required parameter requestParameters.requestid was null or undefined when calling pinsRequestidPost.');
        }

        if (requestParameters.pin === null || requestParameters.pin === undefined) {
            throw new runtime.RequiredError('pin','Required parameter requestParameters.pin was null or undefined when calling pinsRequestidPost.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("accessToken", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/pins/{requestid}`.replace(`{${"requestid"}}`, encodeURIComponent(String(requestParameters.requestid))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: PinToJSON(requestParameters.pin),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PinStatusFromJSON(jsonValue));
    }

    /**
     * Replace an existing pin object (shortcut for executing remove and add operations in one step to avoid unnecessary garbage collection of blocks present in both recursive pins)
     * Replace pin object
     */
    async pinsRequestidPost(requestParameters: PinsRequestidPostRequest, initOverrides?: RequestInit): Promise<PinStatus> {
        const response = await this.pinsRequestidPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
