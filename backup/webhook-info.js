const config = require('./config');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(config.telegram.token);
const domainName = 'https://freestuff-telegram.vercel.app';

bot.telegram.getWebhookInfo().then(console.log).catch(console.error);