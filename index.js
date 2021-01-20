/**
 * The bot configuration file.
 * Check the template file: ./config.template.js
 */
const config = require('./config');

/**
 * The telegram bots library used.
 */
const { Telegraf } = require('telegraf');

const bot = new Telegraf(config.telegramToken);

bot.start((ctx) => ctx.reply('Welcome, the bot is still WIP'));
bot.help((ctx) => ctx.reply('The bot is still WIP'));
bot.command('ping', (ctx) => ctx.reply('Pong 🏓'));

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));