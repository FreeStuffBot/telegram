import type { Product, Store } from 'freestuff'
import { getChannelMeta, getChannelsForProduct, sendMessage, type TelegramChannel } from './telegram'
import { translate, warmTranslations } from './translations'

async function getButtonText(store: Store, language: string) {
  switch (store) {
    case 'steam':
    case 'epic':
    case 'gog':
    case 'humble':
    case 'origin':
    case 'ubi':
      return translate(language, 'open_in_browser')
    default:
      return translate(language, 'announcement_button_text')
  }
}

function getStarRating(rating: number): string {
  const fullStars = Math.round(rating / 20)
  const emptyStars = 5 - fullStars
  const filled = '⭐'.repeat(fullStars)
  const empty = '☆'.repeat(emptyStars)
  const displayRating = Math.round(rating * 50) / 10
  return `${filled}${empty} ${displayRating}/5`
}

function extractTags(tags: string[] | undefined): string | null {
  if (!tags || tags.length === 0) return null
  const selectedTags = tags.slice(0, 3)
  return selectedTags.map(tag => `<b>${tag}</b>`).join(' • ')
}

function getLocalizedDescription(
  descriptions: { lang: string; text: string }[] | undefined,
  preferredLang: string
): string | null {
  if (!descriptions || descriptions.length === 0) return null
  return (
    descriptions.find(d => d.lang === preferredLang) ??
    descriptions.find(d => d.lang === 'en-US')
  )?.text ?? null
}

function getPrimaryProductUrl(product: Product): string {
  return product?.urls?.[0]?.url || `https://google.com/search?q=${encodeURIComponent(product.title)}`
}
  
function getStoreDisplayName(product: Product): string {
  const url = getPrimaryProductUrl(product)
  const host = (() => {
    try {
      return new URL(url).hostname.toLowerCase()
    } catch {
      return ''
    }
  })()

  if (host.includes('fab.com')) {
    return 'Fab'
  }

  if (host.includes('play.google.com')) {
    return 'Google Play Store'
  }

  switch (product.store) {
    case 'steam':
      return 'Steam'
    case 'epic':
      return 'Epic Games Store'
    case 'gog':
      return 'GOG'
    case 'humble':
      return 'Humble Bundle'
    case 'origin':
      return 'Origin'
    case 'ubi':
      return 'Ubisoft'
    case 'itch':
      return 'itch.io'
    case 'prime':
      return 'Prime Gaming'
    case 'other':
    default:
      return product.store.charAt(0).toUpperCase() + product.store.slice(1)
  }
}

async function getStatusLine(
  product: Product,
  language: string,
  priceString: string | null,
  untilString: string | null,
) {
  const storeName = getStoreDisplayName(product)
  const freeTag = await translate(language, 'announcement_pricetag_free')
  const prices = priceString
    ? `<s>${priceString}</s> <b>${freeTag}</b>`
    : `<b>${freeTag}</b>`

  const productType = product.type as string | undefined
  const baseKeyMap: Record<string, 'announcement_price_timed' | 'announcement_price_other' | 'announcement_price_mobile' | 'announcement_price_assets' | 'announcement_price_keep'> = {
    timed: 'announcement_price_timed',
    other: 'announcement_price_other',
    mobile: 'announcement_price_mobile',
    assets: 'announcement_price_assets',
    keep: 'announcement_price_keep',
  }
  const baseKey: 'announcement_price_generic' | 'announcement_price_timed' | 'announcement_price_other' | 'announcement_price_mobile' | 'announcement_price_assets' | 'announcement_price_keep' =
    productType && baseKeyMap[productType] ? baseKeyMap[productType] : 'announcement_price_generic'

  const key = untilString
    ? `${baseKey}_until` as const
    : baseKey

  const baseStatus = await translate(language, key, {
    prices,
    date: untilString ?? '',
  })

  if (productType === 'assets' || productType === 'other') {
    const typeKey = productType === 'assets' ? 'subscription_assets_name' : 'subscription_other_name'
    const typeName = await translate(language, typeKey)
    return `${baseStatus} — ${typeName} — ${storeName}`
  }

  return `${baseStatus} — ${storeName}`
}

async function buildProductMessage(product: Product, to: TelegramChannel) {
  const channelMeta = getChannelMeta()
  const channel = channelMeta[to]
  if (!channel) {
    throw new Error(`Unknown channel ${to}`)
  }

  const validPrices = (product.prices ?? []).filter((p): p is NonNullable<typeof p> => {
    return !!p
      && typeof p.currency === 'string'
      && p.currency.length > 0
      && typeof p.oldValue === 'number'
      && Number.isFinite(p.oldValue)
  })

  const price = validPrices.find(p => p.currency === channel.preferredCurrency)
    || validPrices.find(p => p.currency === 'usd')
    || validPrices.find(p => p.currency === 'eur')
    || validPrices.find(p => !p.converted)
    || validPrices[0]

  let priceString: string | null = null
  if (price && price.oldValue > 0) {
    try {
      const priceFormatter = new Intl.NumberFormat(channel.preferredLanguage, {
        style: 'currency',
        currency: price.currency,
      })
      priceString = priceFormatter.format(price.oldValue / 100)
    } catch {
      priceString = null
    }
  }

  const untilFormatter = new Intl.DateTimeFormat(channelMeta[to].preferredLanguage, {
    dateStyle: 'long',
    timeStyle: 'long',
  })
  const untilString = product.until ? untilFormatter.format(product.until) : null

  const statusLine = await getStatusLine(product, channel.preferredLanguage, priceString, untilString)
  const extra: string[] = []

  if (product.rating !== undefined && product.rating >= 0) {
    extra.push(getStarRating(product.rating))
  }

  const tagString = extractTags(product.tags)
  if (tagString) {
    extra.push(tagString)
  }

  if (product.platforms?.length === 1 && typeof product.platforms[0] === 'string') {
    extra.push(product.platforms[0][0].toUpperCase() + product.platforms[0].slice(1))
  }

  const description = getLocalizedDescription(product.description, channelMeta[to].preferredLanguage)
  const footer = await translate(channel.preferredLanguage, 'announcement_footer', {
    website: '<a href="https://freestuffbot.xyz/">freestuffbot.xyz</a>',
  })
  const noticeLine = product.notice ? `ℹ <i>${product.notice}</i>` : null

  return {
    to,
    text: [
      `<b>${product.title}</b>`,
      description ? `<i>${description}</i>` : null,
      '',
      statusLine,
      extra.length ? extra.join(' — ') : null,
      '',
      noticeLine,
      noticeLine ? '' : null,
      `${footer}${product.copyright ? `  © ${product.copyright}` : ''}`,
    ].filter(l => l !== null).join('\n'),
    imageUrl: product.images?.[0]?.url,
    buttonText: await getButtonText(product.store, channel.preferredLanguage),
    buttonUrl: getPrimaryProductUrl(product),
  }
}

export async function sendProductPost(product: Product, to: TelegramChannel = 'dev') {
  console.log(`Processing product: "${product.title}" (id: ${product.id}) -> channel: ${to}`)
  return sendMessage(await buildProductMessage(product, to))
}

export async function sendToAll(products: Product[]) {
  const channelMeta = getChannelMeta()
  const channelCount = Object.keys(channelMeta).length
  console.log(`sendToAll: ${products.length} product(s), ${channelCount} configured channel(s)`)

  if (channelCount === 0) {
    console.warn('No channels configured — nothing will be posted. Is TELEGRAM_CHANNELS set?')
    return
  }

  const languages = [...new Set(Object.values(channelMeta).map(channel => channel.preferredLanguage))]
  if (languages.length > 0) {
    await warmTranslations(languages)
  }

  for (const product of products) {
    const channels = getChannelsForProduct(product)
    for (const channel of channels) {
      await sendProductPost(product, channel)
    }
  }
}
