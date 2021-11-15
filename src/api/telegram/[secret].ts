import { VercelRequest, VercelResponse } from '@vercel/node';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('The TELEGRAM_BOT_TOKEN has not been set!');

import { bot } from '../../lib/telegram_bot';

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