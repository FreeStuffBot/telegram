const config = require('./config');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(config.telegram.token);
const domainName = 'https://freestuff-telegram.vercel.app';

bot.telegram.setWebhook()
    .then(() => console.log('The webhook has been removed successfully ✅'))
    .catch(console.error);