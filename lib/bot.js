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

bot.start((ctx) => ctx.reply([
    "Heyy, how did you find me??? 🤔",
    "",
    "Anyway, I hope you like the free games I'm announcing at @TheFreeStuff channels!",
    "",
    "Unfortunalty I don't do anything else, <i>yet.</i>",
    "",
    "If you feel confused, or don't know the @TheFreeStuff channels, check the /help command"
].join('\n'), { parse_mode: 'HTML' }));
bot.help((ctx) => ctx.reply([
    "I announce free games offers available on Steam, Epic Games Store, and more!",
    "",
    "You just have to get into @TheFreeStuff channel, pick the language you prefer, and subscribe to get notifications when new offers are available.",
    "And please try to share the channel with your friends so they can be notified too.",
    "",
    "There's nothing useful you can do by interacting by me unfortunately yet.."
].join('\n')));
bot.command('ping', (ctx) => ctx.reply('Pong 🏓'));
bot.command('version', (ctx) => ctx.reply(
    [
        `ℹ This command displays information intended for usage by the bot's developer ℹ`,
        ``,
        `<b>Version Commit:</b>`,
        ``,
        `• Commit: <code>${process.env.VERCEL_GIT_COMMIT_SHA}</code>`,
        `• Commit Message: <code>${process.env.VERCEL_GIT_COMMIT_MESSAGE}</code>`,
        `• Commit Author: <code>${process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME}</code>`
    ].join('\n'), { parse_mode: 'HTML' }
));

module.exports = bot;