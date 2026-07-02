import { Hono, type Context } from 'hono'
import { createHonoHandler } from 'freestuff/hono'
import type { Product } from 'freestuff'
import { sendToAll } from './product-post'

interface Env {
  TELEGRAM_BOT_TOKEN: string
  FREESTUFF_PUBLIC_KEY: string
  FREESTUFF_API_KEY: string
  TELEGRAM_CHANNELS?: string
  DISCORD_WEBHOOK_URL?: string
}

let env: Env | null = null

const app = new Hono<{ Bindings: Env }>()
app.all('*', (c, next) => {
  env = c.env

  if (!env?.TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️  WARNING: TELEGRAM_BOT_TOKEN environment variable is not set!')
    console.warn('   Set it in your .env file (for local development) or configure it in wrangler.jsonc/secrets')
  }

  if (!env?.FREESTUFF_PUBLIC_KEY) {
    console.warn('⚠️  WARNING: FREESTUFF_PUBLIC_KEY environment variable is not set!')
    console.warn('   Get it from the FreeStuff Dashboard: https://dashboard.freestuffbot.xyz')
  }

  if (!env?.FREESTUFF_API_KEY) {
    console.warn('⚠️  WARNING: FREESTUFF_API_KEY environment variable is not set!')
    console.warn('   Set it in your .env file (for local development) or configure it in wrangler.jsonc/secrets')
  }

  if (!env?.TELEGRAM_CHANNELS) {
    console.warn('⚠️  WARNING: TELEGRAM_CHANNELS environment variable is not set — no posts will be sent!')
    console.warn('   Set it as a CF secret: wrangler secret put TELEGRAM_CHANNELS')
  }

  return next()
})

function verifyProductPostAuth(c: Context<{ Bindings: Env }>) {
  const authHeader = c.req.header('authorization')?.trim() ?? ''
  const expectedKey = c.env?.FREESTUFF_API_KEY

  if (!expectedKey) {
    return c.json({ error: 'FREESTUFF_API_KEY is not configured' }, 500)
  }

  if (!authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization header must be Bearer token' }, 401)
  }

  const token = authHeader.slice('Bearer '.length)
  if (token !== expectedKey) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return null
}

async function fetchProduct(productId: string, apiKey: string) {
  const response = await fetch(`https://api.freestuffbot.xyz/v2/products/${encodeURIComponent(productId)}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  })

  if (response.status === 404) {
    throw new Error('Product not found')
  }

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`FreeStuff API fetch failed: ${details}`)
  }

  return (await response.json()) as Product
}

// @ts-ignore
app.post('/event', ...createHonoHandler<Env>(c => c.env?.FREESTUFF_PUBLIC_KEY))

app.post('/product', async (c) => {
  const authError = verifyProductPostAuth(c)
  if (authError) {
    return authError
  }

  const body = await c.req.json().catch(() => null)
  console.log('/product request body:', JSON.stringify(body))
  const productId = String(body?.productId ?? c.req.query('productId') ?? '').trim()
  if (!productId) {
    return c.json({ error: 'productId is required' }, 400)
  }

  const apiKey = c.env.FREESTUFF_API_KEY
  if (!apiKey) {
    return c.json({ error: 'FREESTUFF_API_KEY is not configured' }, 500)
  }

  try {
    const product = await fetchProduct(productId, apiKey)
    await sendToAll([product])
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message === 'Product not found') {
      return c.json({ error: 'Product not found' }, 404)
    }

    return c.json({ error: 'Failed to post product', details: message }, 500)
  }

  return c.json({ success: true, productId })
})

export { env }
export default app