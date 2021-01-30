const { switchToChat } = require('telegraf/typings/button');
const freestuff_webhook = require('../../webhooks/freestuff');
const telegram_webhook = require('../../webhooks/telegram');

module.exports = (req, res) => {
    const targetWebhook = req.query.webhook;

    switch (targetWebhook) {
        case 'freestuff_webhook':
            return freestuff_webhook(req, res);
        case 'telegram_webhook':
            return telegram_webhook(req, res);
        default:
            res.writeHead(404).end(res.statusMessage); //Not found
            break;
    }
}