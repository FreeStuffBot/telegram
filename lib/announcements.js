const config = require('../config');
const { Telegraf } = require('telegraf');
const { FreeStuffApi } = require('freestuff');
const { formatStoreName } = require('./utils');

const bot = new Telegraf(config.telegram.token);

const api = new FreeStuffApi({
    type: config.freestuff.api.partner ? 'partner' : 'basic',
    key: config.freestuff.api.token,
    sid: 'ANNOUNCEMENTS_WORKER',
    version: '1.0.0'
});

function formatCaption(gameData) {
    return [
        `<b>Free Game!</b>`,
        `<b>${gameData.title}</b>`,
        `<s>\$${gameData.org_price.dollar}/€${gameData.org_price.euro}</s> <b>Free</b> until ${gameData.until.toLocaleDateString('en-GB')} • ${formatStoreName(gameData.store)}`,
        `<i>via <a href="https://freestuffbot.xyz">freestuffbot.xyz</a></i>`
    ].join('\n');;
}

async function announceGame(gameData, type) {
    const channels = config.channels[type];
    for (const channelLanguage in channels) {
        const channelId = channels[channelLanguage];

        try {
            await bot.telegram.sendPhoto(channelId, gameData.thumbnail, {
                caption: formatCaption(gameData),
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: 'GET', url: gameData.org_url }]]
                }
            });
            console.log('Announced to', channelId);
        } catch (error) {
            console.error('Failed to announce to', channelId, error);
        }
    }
}

async function fetchAndAnnounce(gamesIds, testing = false) {
    console.log('Fetching and announcing games:', gamesIds);
    const gamesDetails = await api.getGameDetails(gamesIds, 'info');
    console.log("Fetched the games data, announcing...");

    for (const gameId of gamesIds) {
        const gameDetails = gamesDetails[gameId];
        if (!gameDetails) {
            console.log('Missing game details for', gameId, ' skipping...');
            continue;
        }

        const type = testing ? 'testing' : 'non_trash'; //TODO: Process the game's flags.
        await announceGame(gameDetails, type);
    }

    console.log("Fetched and announced the games.");
}

async function handleFreeStuffAPIEvent(event) {
    if (event.event === 'free_games') {
        await fetchAndAnnounce(event.data);

    } else if (event.event === 'webhook_test') {
        console.debug('Webhook test', JSON.stringify(event.data));

        const gamesList = await api.getGameList('all');
        await fetchAndAnnounce(gamesList.slice(0, 5), true);
    }
}

module.exports = {
    handleFreeStuffAPIEvent
}