import { config as loadENV } from 'dotenv';
loadENV();

import { bot } from '../lib/telegram_bot';
bot.telegram.getWebhookInfo().then(console.log).catch(console.error);
