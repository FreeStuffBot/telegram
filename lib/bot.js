const config = require('../config');
const { Telegraf } = require('telegraf');
const { FreeStuffApi } = require('freestuff');

const bot = new Telegraf(config.telegram.token);

const api = new FreeStuffApi({
    type: config.freestuff.api.partner ? 'partner' : 'basic',
    key: config.freestuff.api.token,
    sid: 'INTERACTIVE_WORKER',
    version: '1.0.0'
});

bot.start((ctx) => ctx.reply('Welcome to the freestuff bot!\nThe bot is still under development, and only the channels are functional'));
bot.help((ctx) => ctx.reply('The bot is still under development...'));
bot.command('ping', (ctx) => ctx.reply('Pong 🏓'));

module.exports = bot;