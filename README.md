
# @freestuffbot/telegram

This is a [Cloudflare Worker](https://workers.cloudflare.com/product/workers/) that receives webhook notifications from the [FreeStuff API](https://docs.freestuffbot.xyz/) and sends them out to our [Telegram Channels](https://t.me/freestuff_hub).

This also doubles as a demo project on how to use the [FreeStuff API sdk for JS/TS](https://github.com/FreeStuffBot/typescript-api-sdk).

## Setup

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Telegram bot token from [BotFather](https://t.me/botfather) and add it to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_token_here
   ```

3. Get your FreeStuff API public key from the [FreeStuff Dashboard](https://dashboard.freestuffbot.xyz) and add it to `.env`:
   ```
   FREESTUFF_PUBLIC_KEY=your_public_key_here
   ```

4. Run the development server:
   ```bash
   bun run dev
   ```

### Production Deployment

Set the secrets on Cloudflare:

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put FREESTUFF_PUBLIC_KEY
```

Then deploy:

```bash
bun run deploy
```
