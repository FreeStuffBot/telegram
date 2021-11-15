import { VercelRequest, VercelResponse } from '@vercel/node';

import { fetchAndAnnounceGames } from '../../lib/telegram_bot';
import { api, API_TOKEN } from '../../lib/freestuff_api';

async function handleFreeStuffAPIEvent(event: any) {
    if (event.event === 'free_games') {
        await fetchAndAnnounceGames(event.data, false);
    } else if (event.event === 'webhook_test') {
        console.debug('webhook test', JSON.stringify(event.data));

        const gamesList = await api.getGameList('all', false);
        await fetchAndAnnounceGames(gamesList.slice(0, 1), true);
    }
}

export default async (req: VercelRequest, res: VercelResponse) => {
    const { secret } = req.query;
    if (secret !== API_TOKEN) return res.writeHead(403).end(res.statusMessage); //Forbidden
    if (req.method !== 'POST') return res.writeHead(405).end(res.statusMessage); //Bad request

    const contentType = req.headers['content-type'];
    const contentLength = Number.parseInt(req.headers['content-length'] ?? '');

    if (!contentType || !contentType.startsWith('application/json')) return res.writeHead(405).end(res.statusMessage); //Bad request
    if (!contentLength || contentLength > 1024) return res.writeHead(405).end(res.statusMessage); //Bad request

    try {
        await handleFreeStuffAPIEvent(req.body);
        return res.writeHead(200).end(res.statusMessage); //OK
    } catch(error) {
        console.error(error);
        res.writeHead(500).end(res.statusMessage + '\n' + new String(error)); //Internal server error
    }
};