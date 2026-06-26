import { env } from './server'
import type { Product, Store } from 'freestuff'
import { notifyDiscordWebhook } from './discord'

export type ChannelConfig = {
	chat: string
	preferredCurrency: string
	preferredLanguage: string
	enabled?: boolean
	productTypes?: string[]
}

function parseChannelMeta(raw?: string): Record<string, ChannelConfig> | undefined {
	if (!raw) {
		return undefined
	}

	try {
		const value = JSON.parse(raw)
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return undefined
		}
		return value as Record<string, ChannelConfig>
	} catch (error) {
		console.warn('Failed to parse TELEGRAM_CHANNELS JSON:', error)
		return undefined
	}
}

export function getChannelMeta(): Record<string, ChannelConfig> {
	return parseChannelMeta(env?.TELEGRAM_CHANNELS) ?? {}
}

export type TelegramChannel = string

export type MessageOptions = {
	to: TelegramChannel
	text: string
	imageUrl?: string
	buttonText: string
	buttonUrl: string
}

export async function sendMessage(opts: MessageOptions) {
	if (!env)
		throw new Error('Environment variables not loaded')

	const channelMeta = getChannelMeta()
	const channel = channelMeta[opts.to]
	if (!channel) {
		throw new Error(`Unknown Telegram channel: ${opts.to}`)
	}

	try {
		const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${opts.imageUrl ? 'sendPhoto' : 'sendMessage'}`

		const response = await fetch(telegramUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: channel.chat,
				photo: opts.imageUrl ?? undefined,
				[opts.imageUrl ? 'caption' : 'text']: opts.text,
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: opts.buttonText,
								url: opts.buttonUrl,
							},
						],
					],
				},
			}),
		})

		if (!response.ok) {
			const body = await response.text().catch(() => '<failed to read body>')
			await notifyDiscordWebhook(
				'Telegram API request failed',
				`channel=${opts.to}\nstatus=${response.status}\nbody=${body.slice(0, 1800)}`,
			)
			return
		}

		const telegramResult = await response.json().catch(() => null) as { ok?: boolean; description?: unknown } | null
		if (!telegramResult?.ok) {
			const description = typeof telegramResult?.description === 'string'
				? telegramResult.description
				: 'Unknown Telegram API error'
			await notifyDiscordWebhook(
				'Telegram API rejected message',
				`channel=${opts.to}\ndescription=${description}`,
			)
		}
	} catch (err) {
		console.error(err)
	}
}

export function isChannelEnabled(channel: ChannelConfig, productType: string): boolean {
	if (channel.enabled === false) {
		return false
	}

	if (!channel.productTypes || channel.productTypes.length === 0) {
		return true
	}

	return channel.productTypes.includes(productType)
}

export function getChannelsForProduct(product: Product): TelegramChannel[] {
	const channelMeta = getChannelMeta()
	return Object.entries(channelMeta)
		.filter(([, config]) => isChannelEnabled(config, product.type as string))
		.map(([key]) => key)
}
