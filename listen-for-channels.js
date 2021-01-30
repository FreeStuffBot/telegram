const bot = require('./lib/bot');

bot.on("channel_post", (ctx) => {
    console.log(`ℹ received a channel post from ${ctx.chat.id}`);
});

bot.launch();