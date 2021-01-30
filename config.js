//The configuration file of the bot, uses some secrets stored in the environment variables:
// - TELEGRAM_TOKEN: The Telegram bot token.
// - FREESTUFF_TOKEN or FREESTUFF_PARTNER_TOKEN: The FreeStuff API token.

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const FREESTUFF_TOKEN = process.env.FREESTUFF_TOKEN;
const FREESTUFF_PARTNER_TOKEN = process.env.FREESTUFF_PARTNER_TOKEN;

module.exports = {
    telegram: {
        token: TELEGRAM_TOKEN
    },

    freestuff: {
        api: {
            token: FREESTUFF_PARTNER_TOKEN || FREESTUFF_TOKEN,
            partner: !(!(FREESTUFF_PARTNER_TOKEN))
        }
    },

    channels: {
        testing: {
            ['en-US']: '@freestuff_dev_606026',
        },

        non_trash: {
            ['en-US']: '@freestuff_english_us_561020'
        },

        trash: {
            ['en-US']: '@freestuff_english_us_trash_744068'
        }
    },

    languages: [ 'en-US', 'de-DE' ] //It's okay if a language is missing from the configured channels list.
}