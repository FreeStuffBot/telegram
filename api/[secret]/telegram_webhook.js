const config = require('../../config');
const bot = require('../../lib/bot');

module.exports = async (req, res) => {
    const secret = req.query.secret;
    if (secret !== config.telegram.secret) return res.writeHead(403).end(res.statusMessage); //Forbidden
    if (req.method !== 'POST') return res.writeHead(405).end(res.statusMessage); //Bad request

    try {
        await bot.handleUpdate(req.body, res);
    } catch (error) {
        res.writeHead(500).end(res.statusMessage + '\n' + toString(error)); //Internal server error
    }
}