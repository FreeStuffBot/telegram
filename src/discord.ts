import { env } from './server'

const WEBHOOK_USERNAME = 'FreeStuff · Telegram'
const WEBHOOK_AVATAR = 'https://telegram.org/img/t_logo.png'

export async function notifyDiscordWebhook(message: string, details?: string) {
  const webhookUrl = env?.DISCORD_WEBHOOK_URL?.trim()
  if (!webhookUrl) return

  const payload = {
    username: WEBHOOK_USERNAME,
    avatar_url: WEBHOOK_AVATAR,
    content: `${message}${details ? `\n${details}` : ''}`,
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('Failed to send Discord webhook notification:', err)
  }
}