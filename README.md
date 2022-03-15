## @ipfs-shipyard/pinning-service-client@1.0.0

This client was generated using [openapi-generator](https://github.com/OpenAPITools/openapi-generator) from the [ipfs pinning services API spec](https://raw.githubusercontent.com/ipfs/pinning-services-api-spec/main/ipfs-pinning-service.yaml).

You can see the commands used to generate the client in the `gen:fetch` npm script.

### Usage

This client only has a programmatic API at the moment (no CLI). You use it like so:

```ts

import { Configuration, PinsApi, Status } from '@ipfs-shipyard/pinning-service-client'
import type { PinsGetRequest, PinResults } from '@ipfs-shipyard/pinning-service-client'

const config = new Configuration({
  basePath, // the URI for your pinning provider, e.g. `http://localhost:3000`
  accessToken, // the secret token/key given to you by your pinning provider
  // fetchApi: fetch, // You can pass your own fetchApi implementation, but we use fetch-ponyfill by default.
})

const client = new PinsApi(config)

(async () => {
  // Get 10 failed Pins
  const pinsGetOptions: PinsGetRequest = {
    limit: 10,
    status: new Set([Status.Failed]) // requires a set, and not an array
  }
  const {count, results}: PinResults = await client.pinsGet(pinsGetOptions)

  console.log(count, results)

})()

```
