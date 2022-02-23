import { setup } from 'mock-ipfs-pinning-service'
import type { Application } from 'express'
import type { Server } from 'http'
import portscanner from 'portscanner'
import('dotenvrc')

export class MockServer {
  private _server: Server | undefined = undefined

  private port = Number(process.env.MOCK_PINNING_SERVER_PORT ?? 3000)
  private _service: Application | undefined = undefined

  /**
   * This set helps us support parallel tests by not attempting to start up multiple MockServer's on the same port
   */

  public basePath: string = ''

  constructor () {
    process.on('uncaughtException', MockServer.onEADDRINUSE)
  }

  public async start (port = this.port): Promise<void> {
    let server
    try {
      server = await this.server(port)
    } catch (err) {
      MockServer.error('start error', err)
    }

    if (server == null) {
      process.exit(1)
    }

    // And you'll want to make sure you close the server when your process exits
    process.on('beforeExit', this.cleanupSync)
    process.on('SIGTERM', this.cleanupSync)
    process.on('SIGINT', this.cleanupSync)
    process.on('SIGHUP', this.cleanupSync)

    // To prevent duplicated cleanup, remove the process listeners on server close.
    server.on('close', () => {
      process.off('beforeExit', this.cleanupSync)
      process.off('SIGTERM', this.cleanupSync)
      process.off('SIGINT', this.cleanupSync)
      process.off('SIGHUP', this.cleanupSync)
    })
  }

  public async stop (): Promise<void> {
    await this.cleanup()
  }

  private setBasePath (): void {
    this.basePath = `http://127.0.0.1:${this.port}`
  }

  /**
   * Ensure the port set for this instance is not already in use by another MockServer
   */
  private async getAvailablePort (): Promise<number> {
    return await new Promise((resolve, reject) => portscanner.findAPortNotInUse(3000, 3099, '127.0.0.1', (error, port) => {
      if (error != null) {
        return reject(error)
      }
      this.port = port
      this.setBasePath()
      resolve(port)
    }))
  }

  private async service (): Promise<Application> {
    if (this._service !== undefined) {
      return this._service
    }
    this._service = await setup({
      token: process.env.MOCK_PINNING_SERVER_SECRET
    })

    return this._service
  }

  private async server (port = this.port): Promise<Server> {
    if (this._server !== undefined) {
      return this._server
    }
    if (port !== this.port) {
      this.port = port
    }
    const service = await this.service()

    service.on('error', (err) => {
      MockServer.error('service error', err)
    })
    this._server = service.listen(await this.getAvailablePort(), () => {
      MockServer.debug(`server running on port ${port}`)
    })

    return this._server
  }

  private cleanupSync (): void {
    void this.cleanup().then(() => {
      MockServer.debug('cleaned up')
    })
  }

  // Express server cleanup handling.
  private async cleanup (): Promise<void> {
    const server = await this.server()
    server.close((err) => {
      if ((err == null) || (err as Error & { code: string })?.code === 'ERR_SERVER_NOT_RUNNING') {
        // MockServer.portsInUse.remove(this.port)
        MockServer.debug(`server stopped listening on port ${this.port}`)
        delete this._server
      }
      if (err != null) {
        MockServer.error(err.name)
        MockServer.error(err.message)
        MockServer.error(err.stack)
      }
    })
  }

  private static onEADDRINUSE (err: Error & { code: string }) {
    if (err.code === 'EADDRINUSE') {
      this.error('Unexpected conflict with port usage')
    } else {
      this.error('CAUGHT UNKNOWN ERROR')
      this.error(err.name)
      this.error(err.code)
      this.error(err.message)
      this.error(err.stack)
    }
    process.exit(233)
  }

  private static debug (...logObjects: unknown[]) {
    if (process.env.DEBUG != null) {
      MockServer.log('debug', ...logObjects)
    }
  }

  private static error (...logObjects: unknown[]) {
    if (process.env.DEBUG != null) {
      MockServer.log('error', ...logObjects)
    }
  }

  private static log (type: keyof typeof console & 'log' | 'debug' | 'error' | 'warn' | 'info' | 'trace', ...logObjects: unknown[]) {
    // eslint-disable-next-line no-console
    console[type](...logObjects)
  }
}