const config = require('./config');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(config.telegram.token);
const domainName = 'https://freestuff-telegram.vercel.app';

bot.telegram.setWebhook(`${domainName}/api/${config.telegram.token}/telegram_webhook`)
    .then(() => console.log('The webhook has been set successfully ✅'))
    .catch(console.error);