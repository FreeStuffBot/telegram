import { env } from "./server"


export const channelMeta = {
	dev: {
		chat: '@freestuff_dev_606026',
		preferredCurrency: 'usd',
		preferredLanguage: 'en-US'
	},
	enUs: {
		chat: '@freestuff_english_us',
		preferredCurrency: 'usd',
		preferredLanguage: 'en-US'
	},
	enGb: {
		chat: '@freestuff_english_gb',
		preferredCurrency: 'eur',
		preferredLanguage: 'en-GB'
	},
	de: {
		chat: '@freestuff_german',
		preferredCurrency: 'eur',
		preferredLanguage: 'de-DE'
	}
} satisfies Record<string, { chat: string; preferredCurrency: string; preferredLanguage: string; }>;

export type TelegramChannel = keyof typeof channelMeta;

export type MessageOptions = {
	to: TelegramChannel;
	text: string;
	imageUrl?: string;
	buttonText: string;
	buttonUrl: string;
}

export async function sendMessage(opts: MessageOptions) {
	console.log('sendMessage to ' + opts.to + ', env ' + !!env?.TELEGRAM_BOT_TOKEN)
	if (!env)
		throw new Error('Environment variables not loaded');

	try {
		const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${opts.imageUrl ? 'sendPhoto' : 'sendMessage'}`;

		console.log(JSON.stringify({
			"chat_id": channelMeta[opts.to].chat,
			"photo": opts.imageUrl ?? undefined,
			[ opts.imageUrl ? 'caption' : 'text' ]: opts.text,
			"parse_mode": "HTML",
			"reply_markup": {
				"inline_keyboard": [
					[
						{
							"text": opts.buttonText,
							"url": opts.buttonUrl
						}
					]
				]
			}
		}))

		const res = await fetch(telegramUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				"chat_id": channelMeta[opts.to].chat,
				"photo": opts.imageUrl ?? undefined,
				[ opts.imageUrl ? 'caption' : 'text' ]: opts.text,
				"parse_mode": "HTML",
				"reply_markup": {
					"inline_keyboard": [
						[
							{
								"text": opts.buttonText,
								"url": opts.buttonUrl
							}
						]
					]
				}
			}),
		});
		console.log(`res --->>> ${await res.text}`)
	} catch (err) {
		console.error(err);
	}
}
