const bot = require('./lib/bot');
const config = require('./config');

const menu = [];

for (const languageId in config.menu) {
    const button = {
        text: config.menu[languageId],
        url: `https://t.me/${config.channels.announcements[languageId].substring(1)}`
    };

    if (menu.length && menu[menu.length - 1].length == 1) menu[menu.length - 1].push(button);
    else menu.push([button]);
}

bot.telegram.sendMessage('@thefreestuff',
    [

        "<b>Welcome to FreeStuff!</b>",
        "",
        "We announce available free games offers on Steam, Epic Games Store, and many more!",
        "Please select the channel for your language and subscribe to receive free games announcements 😉",
        "",
        "<i><b>TODO:</b> Write a proper introduction message.</i>",
        "🚧⚠ <b><u>Note: The bot is still under development</u></b> ⚠🚧",

    ].join('\n'),

    {
        reply_markup: { inline_keyboard: menu },
        parse_mode: 'HTML'
    }
);