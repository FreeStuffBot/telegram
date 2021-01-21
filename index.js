/**
 * The bot configuration file.
 * Check the template file: ./config.template.js
 */
const config = require('./config');

/**
 * The telegram bots library used.
 */
const { Telegraf } = require('telegraf');

/**
 * The FreeStuff API wrapper, huge thanks for maanex!
 */
const { FreeStuffApi } = require("freestuff");

const bot = new Telegraf(config.telegramToken);

const api = new FreeStuffApi({
    type: config.freeStuffAPI.partner ? 'partner' : 'basic',
    key: config.freeStuffAPI.token,
    sid: 'DEV_' + Math.floor(10 + Math.random() * 100000),
    version: '0.0.1'
});

api.ping().then(() => console.log('API PONG!')).catch(() => console.log('failed to ping the api...'));

bot.start((ctx) => ctx.reply('Welcome, the bot is still WIP'));
bot.help((ctx) => ctx.reply('The bot is still WIP'));
bot.command('ping', (ctx) => ctx.reply('Pong 🏓'));
bot.on('channel_post', (ctx) => console.log("CHANNEL_ID", ctx.channelPost.chat.id));

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));