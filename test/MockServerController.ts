#!/usr/bin/env ts-node

/* eslint-disable no-console */
import express from 'express'
import { MockServer } from './MockServer'
import Router from 'express-promise-router'
import cors from 'cors'

class MockServerController {
  private readonly mockServers: MockServer[] = []
  private readonly app = express()
  private readonly router = Router()

  private readonly port = 3000
  server: import('http').Server
  constructor () {
    this.router.get<'/start', {port?: string}>('/start', async (req, res, next) => { // eslint-disable-line @typescript-eslint/no-misused-promises
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
          basePath: mockServer.basePath,
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
    this.router.get<'/stop/:port', {port: string}>('/stop/:port', async (req, res, next) => { // eslint-disable-line @typescript-eslint/no-misused-promises
      const { port } = req.params

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
        console.log('Could not get mockserver')
        throw new Error(`MockServer at port ${port} could not be found`)
      }
    })

    this.app.use(cors())
    this.app.use(this.router)

    this.server = this.app.listen(this.port, () => {
      console.log(`MockServerController listening on port ${this.port}`)
    })

    // And you'll want to make sure you close the server when your process exits
    process.on('beforeExit', this.shutdownSync)
    process.on('SIGTERM', this.shutdownSync)
    process.on('SIGINT', this.shutdownSync)
    process.on('SIGHUP', this.shutdownSync)

    // To prevent duplicated cleanup, remove the process listeners on server close.
    this.server.on('close', () => {
    })
  }

  private shutdownSync () {
    this.shutdown().catch((err) => {
      console.error(err)
    })
  }

  async shutdown () {
    process.off('beforeExit', this.shutdownSync)
    process.off('SIGTERM', this.shutdownSync)
    process.off('SIGINT', this.shutdownSync)
    process.off('SIGHUP', this.shutdownSync)
    await new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err != null) {
          console.error('Unexpected error when shutting down the MockServerController')
          console.error(err)
        } else {
          console.log(`MockServerController stopped listening on port ${this.port}`)
        }
        resolve()
      })
    })
    for await (const mockS of this.mockServers) {
      try {
        await mockS.stop()
      } catch (err) {
        console.error(`Unexpected error when attempting to shutdown mock server at ${mockS.basePath}`)
        console.error(err)
      }
    }
  }

  // async startMockServer (req: {params: { port: number}}, res: {basePath: string, accessToken: string}, next: unknown) {

  // }

  private async startIpfsPinningServer (port?: string) {
    const mockServer = new MockServer({
      token: process.env.MOCK_PINNING_SERVER_SECRET
      // loglevel: 'info'
    })
    await mockServer.start(Number(port))

    return mockServer
  }
}

export { MockServerController }
