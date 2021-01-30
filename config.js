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
            ['de-DE']: '@freestuff_dev_606026',
            ['ar-SY']: '@freestuff_dev_606026',
        },

        announcements: {
            ['en-US']: '@freestuff_english_us', //https://t.me/freestuff_english_us
            ['en-GB']: '@freestuff_english_gb', //https://t.me/freestuff_english_gb
            ['pt-BR']: '@freestuff_portuguese_brazil', //https://t.me/freestuff_portuguese_brazil
            ['es-ES']: '@freestuff_spanish_latam', //https://t.me/freestuff_spanish_latam
            ['tr']: '@freestuff_turkish', //https://t.me/freestuff_turkish
            ['it-IT']: '@freestuff_italian', //https://t.me/freestuff_italian
            ['de-DE']: '@freestuff_german', //https://t.me/freestuff_german'
            ['fr-FR']: '@freestuff_french', //https://t.me/freestuff_french
            ['ar-SY']: '@freestuff_arabic', //https://t.me/freestuff_arabic
            ['pl']: '@freestuff_polish', //https://t.me/freestuff_polish

        }
    },

    //It's okay if a language is missing from the configured channels list.
    languages: [
        'en-US',
        'en-GB',
        'pt-BR',
        'es-ES',
        'tr',
        'it-IT',
        'de-DE',
        'fr-FR',
        'ar-SY',
        'pl',
    ]
}