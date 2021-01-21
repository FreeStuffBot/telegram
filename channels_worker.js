const config = require("./config");

const { Telegraf } = require("telegraf");
const { FreeStuffApi } = require("freestuff");

const bot = new Telegraf(config.telegramToken);

const api = new FreeStuffApi({
    type: config.freeStuffAPI.partner ? 'partner' : 'basic',
    key: config.freeStuffAPI.token,
    sid: ('DEV_' + Math.floor(10 + Math.random() * 100000)), //'CHANNELS_WORKER',
    version: '0.0.1'
});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function formatCaption(gameData) {
    return [
        `<b>Free Game!</b>`,
        `<b>${gameData.title}</b>`,
        `<s>\$${gameData.org_price.dollar}/€${gameData.org_price.euro}</s> <b>Free</b> until ${gameData.until.toLocaleDateString('en-GB')} • ${gameData.store}`,
        `<i>via <a href="https://freestuffbot.xyz">freestuffbot.xyz</a></i>`
    ].join('\n');;
}

/**
 * Announces a game on the configured channels.
 * @param {GameData} gameData The game's data to announce.
 */
async function announceGame(gameData) {
    const channels = config.telegramChannels.non_trash;
    for (const channelLanguage in channels) {
        const channelId = channels[channelLanguage];

        console.log("Announcing to", channelId);
        await bot.telegram.sendPhoto(channelId, gameData.thumbnail, {
            caption: formatCaption(gameData),
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[{ text: 'Get', url: gameData.org_url }]]
            }
        });

        console.log("Sleeping for 5 seconds...");
        await sleep(5000);
    }

    console.log("Game announcement completed.")
}

/**
 * Announces a batch of free games at the same time.
 * @param {array} gamesIds An array of game ids to announce.
 */
async function fetchAndAnnounce(gamesIds) {
    console.log("Fetching and announcing games:", gamesIds);
    const gamesDetails = await api.getGameDetails(gamesIds, 'info');
    console.log("Fetched the games data, announcing...");

    for (const gameId of gamesIds) {
        const gameDetails = gamesDetails[gameId];
        if (!gameDetails) continue;
        await announceGame(gameDetails);
    }

    console.log("Fetched and announced the games.")
}

const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url !== config.freeStuffAPI.webhook.url) return res.writeHead(403).end(res.statusMessage); //Forbidden
    if (req.method !== 'POST') return res.writeHead(405).end(res.statusMessage); //Bad request

    const contentType = req.headers["content-type"];
    const contentLength = parseInt(req.headers["content-length"]);

    if (contentType !== 'application/json') return res.writeHead(405).end(res.statusMessage); //Bad request
    if (!contentLength || contentLength > 1024) return res.writeHead(405).end(res.statusMessage); //Bad request

    let buffer = Buffer.alloc(contentLength);
    let bufferOffset = 0;

    req.on('data', (chunk) => {
        if (bufferOffset + chunk.length > contentLength) {
            req.destroy();
            res.writeHead(405).end(res.statusMessage); //Bad request
            return;
        }

        chunk.copy(buffer, bufferOffset);
        bufferOffset += chunk.length;
    });

    req.on('end', () => {
        const payload = buffer.toString('utf-8');
        let event = null;

        try {
            event = JSON.parse(payload);

        } catch (error) {
            console.error("Payload parsing error:", error);

            res.writeHead(500).end(res.statusMessage); //Internal server error
            return;
        }
    
        if (event.secret !== config.freeStuffAPI.webhook.secret) res.writeHead(403).end(res.statusMessage); //Forbidden
    
        if (event.event === 'free_games') fetchAndAnnounce(event.data).catch(console.error);

        res.writeHead(200).end(res.statusMessage); //OK
    });
});

server.listen(config.freeStuffAPI.webhook.port);

function stopWebhookServer(reason) {
    server.close(console.log("Terminated webhook server because of", reason));
}

process.once('SIGINT', () => stopWebhookServer('SIGINT'));
process.once('SIGTERM', () => stopWebhookServer('SIGTERM'));

//api.getGameList('all').then(([a, b, c, d, e]) => { return [a, b, c, d, e] }).then(fetchAndAnnounce).then(console.log).catch(console.err);
//fetchAndAnnounce([545821, 0, 1]).then(console.log).catch(console.err);