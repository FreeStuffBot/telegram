import { config as loadENV } from 'dotenv';
loadENV();

const VERCEL_DOMAIN = process.env.VERCEL_DOMAIN;
if (!VERCEL_DOMAIN) throw new Error('The VERCEL_DOMAIN has not been set!');

import { bot, BOT_TOKEN } from '../lib/telegram_bot';
bot.telegram.setWebhook(`${VERCEL_DOMAIN}/api/telegram/${BOT_TOKEN}`, {
    allowed_updates: ['message'],
})
    .then(() => console.log('The Telegram webhook has been set successfully.'))
    .catch(console.error);