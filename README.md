# @freestuffbot/telegram

A Cloudflare Worker that listens for FreeStuff announcement events and posts matching product alerts to Telegram channels.

## Requirements

- Bun installed on your system
- Cloudflare account configured for `wrangler`
- A Telegram bot token from [BotFather](https://t.me/botfather)
- FreeStuff webhook events configured to send POST requests to this worker's `/event` endpoint

## Setup

1. Clone the repository

2. Install dependencies with Bun:

```bash
bun install
```

> If you do not use Bun, `npm install` also works, but Bun is the preferred workflow in this project.

## Configuration

Set the following environment variables for the worker:

- `TELEGRAM_BOT_TOKEN` - Telegram bot token used to send messages
- `FREESTUFF_PUBLIC_KEY` - FreeStuff event public key for webhook verification
- `FREESTUFF_API_KEY` - FreeStuff REST API key, used for manual `/product` fetches and API calls
- `TELEGRAM_CHANNELS` - JSON string defining channel targets, filters, and enable/disable state
- `DISCORD_WEBHOOK_URL` - optional Discord webhook URL for alerting when Telegram API rejects a message

Example `TELEGRAM_CHANNELS` value:

```json
{"dev":{"chat":"@freestuffbottesteasy","preferredCurrency":"eur","preferredLanguage":"en-US","enabled":true,"productTypes":["timed","other","mobile","assets"]},"de":{"chat":"@freestuff_german","preferredCurrency":"eur","preferredLanguage":"de-DE","enabled":false}}
```

If `TELEGRAM_CHANNELS` is absent or invalid, no Telegram channels will be posted.

> If you edit Cloudflare environment variables or worker secrets, Cloudflare deploys the worker automatically with the new values.

You can use `.env.example` as a starter template for local development.

```bash
cp .env.example .env
```

Then edit `.env` with your real values.

## Local development

Run the worker locally with Wrangler:

```bash
bun run dev
```

If you prefer to run Wrangler directly through Bun:

```bash
bunx wrangler dev
```

## Deployment

Deploy the worker to Cloudflare:

```bash
bun run deploy
```

or:

```bash
bunx wrangler deploy --minify
```

## Worker behavior

- The worker exposes `POST /event`
- Incoming FreeStuff events are verified using `FREESTUFF_PUBLIC_KEY`
- When `fsb:event:announcement_created` is received, the bot posts product details to Telegram
- The worker also exposes `POST /product` for manual posting of a single product ID
- Manual `/product` requests are authenticated with `Authorization: Bearer <FREESTUFF_API_KEY>`
- Telegram messages include the product title, description, price/status, optional image, and a button link
- Message labels are loaded from `https://github.com/FreeStuffBot/translations` (`discord-bot/*.jsonc`) and cached in memory
- Locale fallback order is: configured channel locale -> base language -> `en-US` defaults
- If configured, `DISCORD_WEBHOOK_URL` receives notifications when Telegram API requests fail or are rejected

## Notes

- The worker is implemented with `hono` and `freestuff/hono`
- The Cloudflare config is defined in `wrangler.jsonc`

