import { config as loadENV } from 'dotenv';
loadENV();

import { bot } from '../lib/telegram_bot';
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.info('Ready.');
