const storesDisplayNames = {
    steam: 'Steam',
    epic: 'Epic Games Store',
    humble: 'Humble Bundle',
    gog: 'GOG',
    origin: 'Origin',
    uplay: 'Uplay',
    twitch: 'Twitch',
    itch: 'Itch.io',
    discord: 'Discord',
    apple: 'App Store',
    google: 'Play Store',
    switch: 'Nintendo Game Store',
    ps: 'PlayStation Store',
    xbox: 'Xbox Games Store',
    other: 'Other'
}

/**
 * Formats the display string of a store name.
 * @param {string} storeId The store's id.
 * @returns {string} The formatted store's name.
 */
function formatStoreName(storeId) {
    return storesDisplayNames[storesDisplayNames] || storeId;
}

module.exports = {
    formatStoreName
}