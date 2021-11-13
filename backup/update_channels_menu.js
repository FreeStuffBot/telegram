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
        "We keep you up to date with free games from Steam, Epic Games, and all other major Platforms!",
        "Please select the channel for your language and subscribe to receive a notification every time a game gets a -100% discount 😉",
        "",
        'For more information visit <a href="https://freestuffbot.xyz/">freestuffbot.xyz</a>',
        "",
        "(<em>🚧⚠ Note: The bot is still under development ⚠🚧</em>)",

    ].join('\n'),

    {
        reply_markup: { inline_keyboard: menu },
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    }
);