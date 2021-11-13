
console.info('> Loading .env file...');
import { config as loadENV } from 'dotenv';
loadENV();

console.info('> Loading the bot....');
import { bot } from '../lib/telegram_bot';

console.info('> Requesting telegram webhook info...');
bot.telegram.getWebhookInfo().then(console.log).catch(console.error);
