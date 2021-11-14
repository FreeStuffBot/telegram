import { Telegraf } from 'telegraf';
import * as config from './config';

import { api } from './freestuff_api';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('The TELEGRAM_BOT_TOKEN has not been set!');

export const bot = new Telegraf(BOT_TOKEN);
export const commandsDescriptions: Record<string, string> = {};

bot.start((ctx) => ctx.replyWithHTML(`
You have just met the <b>FreeStuff Master</b>. Who shall only deal with his grand masters.

If you're looking for guidance, our channel <a href="https://t.me/thefreestuff">FreeStuff</a> is there for you.
`));

commandsDescriptions['whoami'] = 'Show the details of the user sending this message 👤';
bot.command('whoami', (ctx) => ctx.replyWithHTML(`
<u>User information:</u>

<b>ID:</b> <code>${new String(ctx.from.id)}</code>
<b>Username:</b> <code>${new String(ctx.from.username)}</code>
<b>First name:</b> <code>${new String(ctx.from.first_name)}</code>
<b>Last name:</b> <code>${new String(ctx.from.last_name)}</code>
<b>Language code:</b> <code>${new String(ctx.from.language_code)}</code>
<b>Bot:</b> <code>${new String(ctx.from.is_bot)}</code>
`));

bot.use(async (ctx, next) => {
    if (ctx.updateType !== 'message') return next();
    if (config.grandMasters.some((id) => id === ctx?.from?.id)) return next();
    ctx.replyWithHTML(`
I shall only deal with my grand masters.
If you're looking for guidance, our channel <a href="https://t.me/thefreestuff">FreeStuff</a> is there for you.
    `);
});

commandsDescriptions['ping'] = 'The classical ping pong 🏓';
bot.command('ping', (ctx) => ctx.reply('Pong 🏓'));

commandsDescriptions['free_games'] = 'Get a list of the currently free games 🗒️';
bot.command('free_games', async (ctx) => ctx.replyWithHTML(`
<code>${JSON.stringify(await api.getGameList('free', true))}</code>
`));

commandsDescriptions['all_games'] = 'Get a list of all the games currently stored in the database 🗒️';
bot.command('all_games', async (ctx) => ctx.replyWithHTML(`
<code>${JSON.stringify(await api.getGameList('all', true))}</code>
`));

export async function sendGameMessage(chatId: string | number, gameData: any, locale: string) {
    const localization = gameData.localized[locale];

    const caption = [
        `<b>${localization.header}</b>`,
        `<b>${gameData.title}</b>`,
        `<s>${localization.org_price_usd}/${localization.org_price_eur}</s> <b>${localization.free}</b> ${localization.until} • ${ [localization.platform, ...localization.flags].join(' • ') }`,
        `<i>${localization.footer.replace('https://freestuffbot.xyz/', '<a href="https://freestuffbot.xyz/">freestuffbot.xyz</a>')}</i>`,
    ].join('\n');

    return bot.telegram.sendPhoto(chatId, gameData.thumbnail.org, {
        caption,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[{ text: localization.claim_short, url: gameData.urls.org }]]
        }
    });
}

commandsDescriptions['game_details'] = 'Displays the details of a game by ID 🕹️';
bot.command('game_details', async (ctx) => {
    const [_, rawGameId, locale] = ctx.message.text.split(' ');
    if (!rawGameId) return ctx.replyWithHTML(`Usage: <code>/game_details (id) [locale]</code>`);

    const gameId = Number.parseInt(rawGameId);

    const details = (await api.getGameDetails([gameId], 'info', {
        language: [locale ?? 'en-US'],
    }, false))[gameId.toString()];

    console.log('Game details', gameId, details);

    return sendGameMessage(ctx.chat.id, details, locale ?? 'en-US');
});
