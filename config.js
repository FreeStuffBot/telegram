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
            ['en-US']: '@freestuff_english_us_561020', //https://t.me/freestuff_english_us_561020
            ['en-GB']: '@freestuff_english_gb_637292', //https://t.me/freestuff_english_gb_637292
            ['pt-BR']: '@freestuff_portuguese_brazil_797843', //https://t.me/freestuff_portuguese_brazil_797843
            ['es-ES']: '@freestuff_spanish_latam_764053', //https://t.me/freestuff_spanish_latam_764053
            ['tr']: -1001221998355, //https://t.me/joinchat/SNY3E9OOi8Jn1mO3
            ['it-IT']: -1001276996569, //https://t.me/joinchat/TB1r2WpVKsZIoeFr
            ['de-DE']: '@freestuff_german_370794', //https://t.me/freestuff_german_370794'
            ['fr-FR']: -1001256507523, //https://t.me/joinchat/SuTIg0WrXoVHNE4M
            ['ar-SY']: '@freestuff_arabic_936767', //https://t.me/freestuff_arabic_936767
            ['pl']: -1001459962181, //https://t.me/joinchat/VwVBRd2kdf0onVUz

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