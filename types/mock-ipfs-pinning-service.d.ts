import type { Application } from 'express';

export module 'mock-ipfs-pinning-service' {
  declare const MockIpfsPinningService = {
    setup: () => Application,
  }
  export default {
    setup: express.application,
  };
  export default MockIpfsPinningService;
}
