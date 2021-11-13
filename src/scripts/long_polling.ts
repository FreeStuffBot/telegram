
console.info('> Loading .env file...');
import { config as loadENV } from 'dotenv';
loadENV();

console.info('> Launching the bot....');
import { bot } from '../lib/telegram_bot';
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.info('> Ready ✔️');
