## IPFS Pinning Service API Client for JS

This client was generated using [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) from the [IPFS Pinning Service API spec](https://ipfs.github.io/pinning-services-api-spec/).

You can see the commands used to generate the client in the `gen:fetch` npm script.

### Usage

```
npm install @ipfs-shipyard/pinning-service-client --save
```

This client only has a programmatic API at the moment (no CLI). You use it like so:

```ts

import { Configuration, RemotePinningServiceClient, Status } from '@ipfs-shipyard/pinning-service-client'
import type { PinsGetRequest, PinResults } from '@ipfs-shipyard/pinning-service-client'

const config = new Configuration({
  endpointUrl, // the URI for your pinning provider, e.g. `http://localhost:3000`
  accessToken, // the secret token/key given to you by your pinning provider
  // fetchApi: fetch, // You can pass your own fetchApi implementation, but we use NodeJS fetch by default.
})

const client = new RemotePinningServiceClient(config)

(async () => {
  // Get 10 failed Pins
  const pinsGetOptions: PinsGetRequest = {
    limit: 10,
    status: [Status.Failed]
  }
  const {count, results}: PinResults = await client.pinsGet(pinsGetOptions)

  console.log(count, results)

})()

```

## Developing

### Building

To build and compile the typescript sources to javascript use:
```
npm install
npm run build
```

### Updating the generated client

To update the client, you need to `npm run gen` npm script. This will fetch the latest version of the OpenAPI spec and generate the client. However, openapi-generator-cli does not currently generate the client code with proper import syntax. So you must modify the imports in `generated/fetch/**` directly, or just `git checkout -p` to remove the invalid import path changes.

It also uses `Set`s for all collection types though it cannot serialize or deserialize these types to/from JSON. They must be manually changed to be `Array`s.

If you need to modify the generated code's import paths, you will have to run `npm run postgen` manually.

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

### Publishing

First build the package then run ```npm publish```

## License

Licensed under either of

 * Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / http://www.apache.org/licenses/LICENSE-2.0)
 * MIT ([LICENSE-MIT](LICENSE-MIT) / http://opensource.org/licenses/MIT)

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall
be dual licensed as above, without any additional terms or conditions.
