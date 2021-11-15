import { VercelRequest, VercelResponse } from '@vercel/node';
import { bot, BOT_TOKEN } from '../../lib/telegram_bot';

export default async (req: VercelRequest, res: VercelResponse) => {
    const { secret } = req.query;
    if (secret !== BOT_TOKEN) return res.writeHead(403).end(res.statusMessage); //Forbidden
    if (req.method !== 'POST') return res.writeHead(405).end(res.statusMessage); //Bad request

    try {
        await bot.handleUpdate(req.body, res);
    } catch (error) {
        return res.writeHead(500).end(res.statusMessage + '\n' + new String(error));
    }
};