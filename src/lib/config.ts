/**
 * The administrators who can access the bot commands.
 * Which is an array of user ids that can be obtained with the `/whoami` command.
 */
export const grandMasters: number[] = [ 856875680 ];

/**
 * The channels on which free games are announced to.
 * Each locale has it's own channel.
 */
export const announcementChannels: Record<string, string> = {
    ['en-US']: '@freestuff_english_us', //https://t.me/freestuff_english_us
    ['en-GB']: '@freestuff_english_gb', //https://t.me/freestuff_english_gb
    ['pt-BR']: '@freestuff_portuguese_brazil', //https://t.me/freestuff_portuguese_brazil
    ['es-ES']: '@freestuff_spanish_latam', //https://t.me/freestuff_spanish_latam
    ['tr']: '@freestuff_turkish', //https://t.me/freestuff_turkish
    ['it-IT']: '@freestuff_italian', //https://t.me/freestuff_italian
    ['de-DE']: '@freestuff_german', //https://t.me/freestuff_german
    ['fr-FR']: '@freestuff_french', //https://t.me/freestuff_french
    ['ar-SY']: '@freestuff_arabic', //https://t.me/freestuff_arabic
    ['pl']: '@freestuff_polish', //https://t.me/freestuff_polish
};

/**
 * The channels which receive a testing announcements.
 * Which happens when the test button is pressed in the freestuff dashboard.
 */
export const testingChannels: Record<string, string> = {
    ['en-US']: '@freestuff_dev_606026',
    ['de-DE']: '@freestuff_dev_606026',
    ['ar-SY']: '@freestuff_dev_606026',
};

/**
 * The labels of the announcements channels.
 * Used in the main channel that has buttons for each sub-channel.
 */
export const channelsLabels: Record<string, string> = {
    ['en-US']: 'English (USA) 🇺🇸',
    ['en-GB']: 'English (Europe) 🇬🇧',
    ['pt-BR']: 'Português 🇧🇷',
    ['es-ES']: 'Español Latam 🇪🇸',
    ['tr']: 'Türkçe 🇹🇷',
    ['it-IT']: 'Italiano 🇮🇹',
    ['de-DE']: 'Deutsch 🇩🇪',
    ['fr-FR']: 'Français 🇫🇷',
    ['ar-SY']: 'العربية 🇸🇾',
    ['pl']: 'Polski 🇵🇱',
};
