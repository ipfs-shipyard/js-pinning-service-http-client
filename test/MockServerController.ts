import cors from 'cors'
import express from 'express'
import Router from 'express-promise-router'
import { MockServer } from './MockServer.js'
import { logger } from './logger.js'
import type { Server } from 'http'

/**
 * MockServerController stands up a server on port 3000
 */
class MockServerController {
  private readonly mockServers: MockServer[] = []
  private readonly app = express()
  private readonly router = Router()

  private readonly port = 3000
  server: Server
  constructor () {
    this.shutdown.bind(this)
    this.shutdownSync.bind(this)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.router.get<'/start', { port?: string }>('/start', async (req, res, next) => {
      logger.debug('MockServerController: /start GET request received')
      const { port } = req.params

      let mockServer: MockServer | null = null
      try {
        mockServer = await this.startIpfsPinningServer(port)
        this.mockServers.push(mockServer)

        /**
         * We need to return the basePath and accessToken so the client can call the correct mockServer
         */
        res.send({
          success: true,
          endpointUrl: mockServer.basePath,
          accessToken: process.env.MOCK_PINNING_SERVER_SECRET
        })
      } catch (error) {
        res.json({ success: false, error })
        next(error)
      }
    })

    /**
     * A client will request to shut down it's mockServer by port, which it should have received upon calling '/start'
     */
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.router.get<'/stop/:port', { port: string }>('/stop/:port', async (req, res, next) => {
      const { port } = req.params
      logger.debug(`MockServerController: /stop/${port.toString()} GET request received`)

      const mockServer = this.mockServers.find((mockS) => mockS.basePath.includes(port))

      if (mockServer != null) {
        try {
          await mockServer.stop()
          res.json({ success: true })
        } catch (error) {
          res.json({ success: false, error })
          next(error)
        }
      } else {
        logger.error('Could not get mockserver')
        throw new Error(`MockServer at port ${port} could not be found`)
      }
    })

    this.app.use(cors())
    this.app.use(this.router)

    this.server = this.app.listen(this.port, () => {
      logger.debug(`MockServerController listening on port ${this.port}`)
    })

    // And you'll want to make sure you close the server when your process exits
    process.on('beforeExit', this.shutdownSync)
    process.on('SIGTERM', this.shutdownSync)
    process.on('SIGINT', this.shutdownSync)
    process.on('SIGHUP', this.shutdownSync)

    this.server.on('close', () => {
      logger.debug(`MockServerController stopped listening on ${this.port}`)
    })
  }

  private shutdownSync (): void {
    this.shutdown().catch((err) => {
      logger.error(err)
    })
  }

  async shutdown (): Promise<void> {
    // To prevent duplicated cleanup, remove the process listeners on server close.
    process.off('beforeExit', this.shutdownSync)
    process.off('SIGTERM', this.shutdownSync)
    process.off('SIGINT', this.shutdownSync)
    process.off('SIGHUP', this.shutdownSync)
    await new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err != null) {
          logger.error('Unexpected error when shutting down the MockServerController')
          logger.error(err)
        } else {
          logger.debug(`MockServerController stopped listening on port ${this.port}`)
        }
        resolve()
      })
    })
    for await (const mockS of this.mockServers) {
      try {
        await mockS.stop()
      } catch (err) {
        logger.error(`Unexpected error when attempting to shutdown mock server at ${mockS.basePath}`)
        logger.error(err)
      }
    }
  }

  private async startIpfsPinningServer (port?: string): Promise<MockServer> {
    const mockServer = new MockServer({
      token: process.env.MOCK_PINNING_SERVER_SECRET
    })
    await mockServer.start(port)

    return mockServer
  }
}

export { MockServerController }
