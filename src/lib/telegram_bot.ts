
import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('The TELEGRAM_BOT_TOKEN has not been set!');

export const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));

export default bot;
