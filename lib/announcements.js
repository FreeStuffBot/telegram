const config = require('../config');
const { Telegraf } = require('telegraf');
const { FreeStuffApi } = require('freestuff');

const bot = new Telegraf(config.telegram.token);

const api = new FreeStuffApi({
    type: config.freestuff.api.partner ? 'partner' : 'basic',
    key: config.freestuff.api.token,
    sid: 'ANNOUNCEMENTS_WORKER',
    version: '1.0.0'
});

function formatCaption(gameData, localized) {
    return [
        `<b>${localized.header}</b>`,
        `<b>${gameData.title}</b>`,
        `<s>${localized.org_price_usd}/${localized.org_price_eur}</s> <b>${localized.free}</b> ${localized.until} • ${ [localized.platform, ...localized.flags].join(' • ') }`,
        `<i>${localized.footer.replace('https://freestuffbot.xyz/', '<a href="https://freestuffbot.xyz/">freestuffbot.xyz</a>')}</i>`
    ].join('\n');
}

async function announceGame(gameData, type) {
    const channels = config.channels[type];
    for (const languageID in channels) {
        const channelId = channels[languageID];

        try {
            await bot.telegram.sendPhoto(channelId, gameData.thumbnail.org, {
                caption: formatCaption(gameData, gameData.localized[languageID] || {}),
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: gameData.localized[languageID].claim_short, url: gameData.org_url }]]
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
    const gamesDetails = await api.getGameDetails(gamesIds, 'info', {
        language: config.languages
    });
    console.log("Fetched the games data, announcing...");

    for (const gameId of gamesIds) {
        const gameDetails = gamesDetails[gameId];
        if (!gameDetails) {
            console.log('Missing game details for', gameId, ' skipping...');
            continue;
        }

        const type = testing ? 'testing' : 'announcements';
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
        await fetchAndAnnounce(gamesList.slice(0, 1), true);
    }
}

module.exports = {
    handleFreeStuffAPIEvent
}
