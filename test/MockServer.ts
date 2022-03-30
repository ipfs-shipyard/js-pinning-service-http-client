import { setup } from 'mock-ipfs-pinning-service'
import type { Application } from 'express'
import type { Server } from 'http'
import portscanner from 'portscanner'
import cors from 'cors'

import { logger } from './logger.js'

try {
  import('dotenvrc')
} catch (err) {
  // no dotenvrc.. that's okay
  // eslint-disable-next-line no-console
  console.warn('No .envrc file found; assuming CI environment. If not: You should copy .envrc-copy and set your environment variables.')
}

export class MockServer {
  private _server: Server | undefined = undefined

  private port: string = '3001'
  private _service: Application | undefined = undefined

  public basePath: string = ''

  constructor (private readonly config: Parameters<typeof import('mock-ipfs-pinning-service')['setup']>[0] = { token: process.env.MOCK_PINNING_SERVER_SECRET }) {
    process.on('uncaughtException', MockServer.onEADDRINUSE)
  }

  public async start (port = this.port): Promise<void> {
    let server
    try {
      server = await this.server(port)
    } catch (err) {
      logger.error('start error', err)
    }

    if (server == null) {
      process.exit(1)
    }
    const handler = this.cleanupSync.bind(this)
    // And you'll want to make sure you close the server when your process exits
    process.on('beforeExit', handler)
    process.on('SIGTERM', handler)
    process.on('SIGINT', handler)
    process.on('SIGHUP', handler)

    // To prevent duplicated cleanup, remove the process listeners on server close.
    server.on('close', () => {
      process.off('beforeExit', handler)
      process.off('SIGTERM', handler)
      process.off('SIGINT', handler)
      process.off('SIGHUP', handler)
    })
  }

  public async stop (): Promise<void> {
    await this.cleanup()
  }

  private async server (port = this.port): Promise<Server> {
    if (this._server !== undefined) {
      return this._server
    }
    if (port != null && port !== this.port) {
      this.port = port
      this.setBasePath()
    } else {
      port = await this.getAvailablePort()
    }
    const service = await this.service()

    service.on('error', (err) => {
      logger.error('service error', err)
    })
    this._server = service.listen(port, () => {
      logger.debug(`${Date.now()}: MockServer running on port ${port}`)
    })

    return this._server
  }

  /**
   * Ensure the port set for this instance is not already in use by another MockServer
   */
  private async getAvailablePort (): Promise<string> {
    return await new Promise((resolve, reject) => portscanner.findAPortNotInUse(3000, 3099, '127.0.0.1', (error, port) => {
      if (error != null) {
        return reject(error)
      }
      this.port = port.toString()
      this.setBasePath()
      resolve(this.port)
    }))
  }

  private async service (): Promise<Application> {
    if (this._service !== undefined) {
      return this._service
    }
    this._service = await setup(this.config)

    this._service.use(cors())

    return this._service
  }

  private setBasePath (): void {
    if (this.port == null) {
      throw new Error('Attempted to set basePath before setting this.port.')
    }
    this.basePath = `http://127.0.0.1:${this.port}`
  }

  private cleanupSync (): void {
    void this.cleanup().then(() => {
      logger.debug('cleaned up')
    })
  }

  // Express server cleanup handling.
  private async cleanup (): Promise<void> {
    const server = await this.server()
    const port = this.port
    server.close((err) => {
      if ((err == null) || (err as Error & { code: string })?.code === 'ERR_SERVER_NOT_RUNNING') {
        // MockServer.portsInUse.remove(this.port)
        logger.debug(`${Date.now()}: MockServer stopped listening on port ${port}`)
        delete this._server
      } else if (err != null) {
        throw err
      }
    })
  }

  private static onEADDRINUSE (err: Error & { code: string }) {
    if (err.code === 'EADDRINUSE') {
      logger.error('Unexpected conflict with port usage')
    } else {
      logger.error('CAUGHT UNKNOWN ERROR')
      logger.error(err.name)
      logger.error(err.code)
      logger.error(err.message)
      logger.error(err.stack)
    }
    process.exit(1)
  }
}
