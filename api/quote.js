const LIMITS = {
  name: 120,
  company: 160,
  phone: 40,
  email: 160,
  service: 40,
  message: 2000,
  website: 120,
  form_started_at: 30
}

const SERVICES = new Set(['', 'dotacion', 'medicos', 'industrial', 'escolar', 'bordado'])

function cleanString(value, maxLength) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength)
}

function normalizeQuote(input = {}) {
  return Object.fromEntries(Object.entries(LIMITS).map(([key, maxLength]) => [key, cleanString(input[key], maxLength)]))
}

function validateQuote(input) {
  const quote = normalizeQuote(input)
  const errors = {}

  if (!quote.name || quote.name.length < 2) errors.name = 'required'
  if (!quote.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quote.email)) errors.email = 'invalid'
  if (!SERVICES.has(quote.service)) errors.service = 'invalid'
  if (quote.website) return { honeypot: true, quote, errors: {} }

  if (quote.form_started_at) {
    const startedAt = Number(quote.form_started_at)
    if (!Number.isFinite(startedAt) || Date.now() - startedAt < 900) errors.form_started_at = 'too_fast'
  }

  return { honeypot: false, quote, errors }
}

function respond(res, status, body) {
  return res.status(status).json(body)
}

async function deliverQuote(quote) {
  const webhookUrl = process.env.QUOTE_WEBHOOK_URL
  if (!webhookUrl) return { configured: false }

  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }
  if (process.env.QUOTE_WEBHOOK_SECRET) headers['X-Quote-Webhook-Secret'] = process.env.QUOTE_WEBHOOK_SECRET

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: 'bordados-yussi-website',
      receivedAt: new Date().toISOString(),
      quote
    })
  })

  if (!response.ok) throw new Error(`Provider responded with ${response.status}`)
  return { configured: true }
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body)

  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > 100000) throw new Error('PAYLOAD_TOO_LARGE')
  }
  return body ? JSON.parse(body) : {}
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return respond(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' })
  }

  let input
  try {
    input = await readBody(req)
  } catch (error) {
    return respond(res, error.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400, {
      ok: false,
      code: error.message === 'PAYLOAD_TOO_LARGE' ? 'PAYLOAD_TOO_LARGE' : 'INVALID_JSON'
    })
  }

  const { quote, errors, honeypot } = validateQuote(input)
  if (honeypot) return res.status(204).end()
  if (Object.keys(errors).length) return respond(res, 422, { ok: false, code: 'VALIDATION_ERROR', fields: errors })

  try {
    const delivery = await deliverQuote(quote)
    if (!delivery.configured) return respond(res, 503, { ok: false, code: 'LEAD_PROVIDER_NOT_CONFIGURED' })
    return respond(res, 200, { ok: true })
  } catch {
    return respond(res, 502, { ok: false, code: 'LEAD_PROVIDER_UNAVAILABLE' })
  }
}

module.exports = handler
module.exports.normalizeQuote = normalizeQuote
module.exports.validateQuote = validateQuote
