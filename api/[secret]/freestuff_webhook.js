const config = require('../../config');
const { handleFreeStuffAPIEvent } = require('../../lib/announcements');

module.exports = async (req, res) => {
    const secret = req.query.secret;
    if (secret !== config.freestuff.api.token) return res.writeHead(403).end(res.statusMessage); //Forbidden
    if (req.method !== 'POST') return res.writeHead(405).end(res.statusMessage); //Bad request

    const contentType = req.headers["content-type"];
    const contentLength = parseInt(req.headers["content-length"]);

    if (!contentType || !contentType.startsWith('application/json')) return res.writeHead(405).end(res.statusMessage); //Bad request
    if (!contentLength || contentLength > 1024) return res.writeHead(405).end(res.statusMessage); //Bad request

    try {
        await handleFreeStuffAPIEvent(req.body);
        res.writeHead(200).end(res.statusMessage); //OK
    } catch (error) {
        res.writeHead(500).end(res.statusMessage + '\n' + toString(error)); //Internal server error
    }
}