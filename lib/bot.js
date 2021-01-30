const config = require('../config');
const { Telegraf } = require('telegraf');
const { FreeStuffApi } = require('freestuff');

const bot = new Telegraf(config.telegram.token);

const api = new FreeStuffApi({
    type: config.freestuff.api.partner ? 'partner' : 'basic',
    key: config.freestuff.api.token,
    sid: 'INTERACTIVE_WORKER',
    version: '1.1.0'
});

bot.start((ctx) => ctx.reply('Welcome to the freestuff bot!\nThe bot is still under development, and only the channels are functional'));
bot.help((ctx) => ctx.reply('The bot is still under development...'));
bot.command('ping', (ctx) => ctx.reply('Pong 🏓'));
bot.command('version', (ctx) => ctx.reply(
    [
        `<b>Bot version information:</b>`,
        `• Commit: <code>${process.env.VERCEL_GIT_COMMIT_SHA}</code>`,
        `• Commit Message: <code>${process.env.VERCEL_GIT_COMMIT_MESSAGE}</code>`,
        `• Commit Author: <code>${process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME}</code>`
    ].join('\n'), { parse_mode: 'HTML' }
));

module.exports = bot;