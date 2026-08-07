import { defineConfig } from 'vite'
import quoteHandler from './api/quote.js'

function quoteApiDevMiddleware() {
  return {
    name: 'quote-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/quote', async (req, res) => {
        const response = {
          setHeader: (name, value) => res.setHeader(name, value),
          status(code) {
            res.statusCode = code
            return this
          },
          json(body) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(body))
            return this
          },
          end: () => res.end()
        }

        await quoteHandler(req, response)
      })
    }
  }
}

export default defineConfig({
  plugins: [quoteApiDevMiddleware()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
