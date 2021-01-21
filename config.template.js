module.exports = {
    telegramToken: "The bot token provided by @BotFather on Telegram",
    freeStuffAPI: {
        token: "The freestuff api token",
        partner: false, //Whether this is a partner token or not
        webhook: {
            port: 8080,
            url: '/the/url/to/match',
            secret: 'the_64_character_or_less_webhook_secret'
        }
    },
    telegramChannels: {
        non_trash: {
            ["english-us"]: -1412
        },
    
        trash: {
            ["english-us"]: "channel chat id as a number, or the channel username as a string, prefixed with a @"
        }
    }
}