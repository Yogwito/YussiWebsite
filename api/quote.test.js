const test = require('node:test')
const assert = require('node:assert/strict')
const handler = require('./quote.js')

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
    end() { this.ended = true; return this }
  }
}

test('normalizes and bounds quote fields', () => {
  const quote = handler.normalizeQuote({ name: `  ${'a'.repeat(200)}  `, email: 'buyer@example.com' })
  assert.equal(quote.name.length, 120)
  assert.equal(quote.email, 'buyer@example.com')
})

test('rejects non-POST requests', async () => {
  const res = mockResponse()
  await handler({ method: 'GET' }, res)
  assert.equal(res.statusCode, 405)
  assert.equal(res.body.code, 'METHOD_NOT_ALLOWED')
})

test('rejects invalid quote payloads without provider access', async () => {
  const res = mockResponse()
  await handler({ method: 'POST', body: { name: '', email: 'invalid' } }, res)
  assert.equal(res.statusCode, 422)
  assert.equal(res.body.code, 'VALIDATION_ERROR')
})

test('silently discards honeypot submissions', async () => {
  const res = mockResponse()
  await handler({ method: 'POST', body: { name: 'Bot', email: 'bot@example.com', website: 'spam' } }, res)
  assert.equal(res.statusCode, 204)
  assert.equal(res.ended, true)
})

test('returns an explicit configuration state when no provider exists', async () => {
  const previous = process.env.QUOTE_WEBHOOK_URL
  delete process.env.QUOTE_WEBHOOK_URL
  const res = mockResponse()
  await handler({ method: 'POST', body: { name: 'Ana', email: 'ana@example.com', service: 'dotacion' } }, res)
  if (previous) process.env.QUOTE_WEBHOOK_URL = previous
  assert.equal(res.statusCode, 503)
  assert.equal(res.body.code, 'LEAD_PROVIDER_NOT_CONFIGURED')
})

test('delivers a normalized quote through the configured webhook contract', async () => {
  const previousUrl = process.env.QUOTE_WEBHOOK_URL
  const previousFetch = global.fetch
  let received
  process.env.QUOTE_WEBHOOK_URL = 'https://hooks.example.test/quotes'
  global.fetch = async (url, options) => {
    received = { url, options, body: JSON.parse(options.body) }
    return { ok: true, status: 202 }
  }

  const res = mockResponse()
  await handler({ method: 'POST', body: { name: ' Ana ', email: 'ana@example.com', service: 'dotacion', message: ' 40 polos ' } }, res)

  if (previousUrl) process.env.QUOTE_WEBHOOK_URL = previousUrl
  else delete process.env.QUOTE_WEBHOOK_URL
  global.fetch = previousFetch

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.ok, true)
  assert.equal(received.url, 'https://hooks.example.test/quotes')
  assert.equal(received.body.quote.name, 'Ana')
  assert.equal(received.body.quote.message, '40 polos')
})
