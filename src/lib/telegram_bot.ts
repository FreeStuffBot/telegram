import { Telegraf } from 'telegraf';
import * as _ from 'lodash';

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

    console.log('Sending a message for the game', gameData.id, 'in chat', chatId);
    
    const caption = [
        `<b>${localization.header}</b>`,
        `<b>${gameData.title}</b>`,
        `<s>${localization.org_price_usd}/${localization.org_price_eur}</s> <b>${localization.free}</b> ${localization.until} • ${[localization.platform, ...localization.flags].join(' • ')}`,
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

/**
 * Announces a game into the channels.
 * 
 * @param gameData It's expected to contain the needed locales.
 * @param testing Whether to use testing or production channels.
 */
export async function announceGame(gameData: any, testing: boolean | string) {
    const channels = testing ? config.testingChannels : config.announcementChannels;

    console.log('announcing the game', gameData.id);

    for (let locale in channels) {
        let channelId = channels[locale];
        await sendGameMessage(channelId, gameData, locale);
    }
}

/**
 * Fetchs the data for a group of games and announces them.
 * @param testing Whether to use testing or production channels.
 */
export async function fetchAndAnnounceGames(gamesIds: number[], testing: boolean | string) {
    const channels = testing ? config.testingChannels : config.announcementChannels;
    const locales = _.uniq([...Object.keys(config.testingChannels), ...Object.keys(config.announcementChannels)]);

    console.log('fetching the details of games', gamesIds);

    const games = await api.getGameDetails(gamesIds, 'info', {
        language: locales,
    }, true);

    const sortedGames = Object.values(games).sort((a, b) => b.id - a.id);

    for (let gameDetails of sortedGames) {
        await announceGame(gameDetails, testing);
    }
}
