import { on, Product, Store } from 'freestuff'
import { channelMeta, sendMessage, TelegramChannel } from './telegram'


type HonoEvent = {
  $hono: {
    executionCtx: ExecutionContext
  }
}

function getButtonText(store: Store) {
  switch (store) {
    case 'steam':
      return 'View on Steam';
    case 'epic':
      return 'View on Epic Games';
    case 'gog':
      return 'View on GOG';
    default:
      return 'Open Website';
  }
}

function getStarRating(rating: number): string {
  const fullStars = Math.round(rating / 20);
  const emptyStars = 5 - fullStars;
  const filled = '⭐'.repeat(fullStars);
  const empty = '☆'.repeat(emptyStars);
  const displayRating = Math.round(rating * 50) / 10;
  return `${filled}${empty} ${displayRating}/5`;
}

function extractTags(tags: string[] | undefined): string | null {
  if (!tags || tags.length === 0) return null;
  // Take first 2-3 tags to keep it compact
  const selectedTags = tags.slice(0, 3);
  return selectedTags.map(tag => `<b>${tag}</b>`).join(' • ');
}

function getLocalizedDescription(
  descriptions: { lang: string; text: string }[] | undefined,
  preferredLang: string
): string | null {
  if (!descriptions || descriptions.length === 0) return null; // this should never happen, but just in case

  // exact match (e.g. "de-DE")
  let found = descriptions.find(d => d.lang === preferredLang);

  // fallback to en-US
  if (!found) {
    found = descriptions.find(d => d.lang === 'en-US');
  }

  return found?.text ?? null;
}

function sendProductMessage(product: Product, to: TelegramChannel) {
  const price = product.prices.find(p => p.currency === channelMeta[to].preferredCurrency)
    || product.prices.find(p => p.currency === 'usd')
    || product.prices.find(p => p.currency === 'eur')
    || product.prices.find(p => !p.converted)
    || product.prices[0];
  const priceFormatter = new Intl.NumberFormat(channelMeta[to].preferredLanguage, {
    style: 'currency',
    currency: price.currency,
  });
  const priceString = priceFormatter.format(price.oldValue / 100);

  const untilFormatter = new Intl.DateTimeFormat(channelMeta[to].preferredLanguage, {
    dateStyle: 'long',
    timeStyle: 'long'
  });
  const untilString = product.until
    ? `until ${untilFormatter.format(product.until)}`
    : '';

  let statusString: string[] = [`<s>${priceString}</s> <b>FREE</b>`];

  const extra: string[] = [];

  switch (product.type) {
    case 'timed':
      statusString = ['<b>Free Weekend</b>'];
      break;
    case 'other':
      statusString.push('DLC / Addon');
      break;
    case 'mobile':
      statusString.push('Mobile Game');
      break;
    case 'assets':
      statusString.push('Gamedev Assets');
      break;
  }

  // Add enhanced rating display
  if (product.rating !== undefined && product.rating >= 0) {
    extra.push(getStarRating(product.rating));
  }

  // Add genre tags
  const tagString = extractTags(product.tags);
  if (tagString) {
    extra.push(tagString);
  }

  if (product.platforms.length === 1) {
    extra.push(product.platforms[0][0].toUpperCase() + product.platforms[0].slice(1));
  }

  return sendMessage({
    to,
    text: [
      `<b>${product.title}</b>`,
      `<i>${getLocalizedDescription(product.description, channelMeta[to].preferredLanguage)}</i>`,
      '',
      `${statusString.join(' ')} ${untilString}`,
      extra.length ? extra.join(' — ') : null,
      '',
      product.notice ? `ℹ <i>${product.notice}</i>` : null, // If the product has a notice, add it
      '',
      `via <a href="https://freestuffbot.xyz/">freestuffbot.xyz</a>${product.copyright ? `  © ${product.copyright}` : ''}`
    ].filter(l => l !== null).join('\n'),
    imageUrl: product.images[0]?.url,
    buttonText: getButtonText(product.store),
    buttonUrl: product.urls[0]?.url || `https://google.com/search?q=${encodeURIComponent(product.title)}` // this should never happen lol, but just in case
  });
}

async function sendToAll(products: Product[]) {
  for (const product of products) {
    await sendProductMessage(product, 'enUs');
    await sendProductMessage(product, 'enGb');
    await sendProductMessage(product, 'de');
    // await sendProductMessage(product, 'dev');
  }
}

on('fsb:event:ping', (event) => {
  console.log('Received ping event:', event);
});

on('fsb:event:announcement_created', (event) => {
  const ctx = (event as typeof event & HonoEvent).$hono.executionCtx;
  ctx.waitUntil(sendToAll(event.data.resolvedProducts));
});

import { parseProduct } from 'freestuff/parser'

const testProduct = parseProduct({
  title: 'FreeStuff Test Product',
  prices: [
    { currency: 'usd', oldValue: 1337, newValue: 0, converted: false },
    { currency: 'eur', oldValue: 2, newValue: 1, converted: true }
  ],
  kind: 'game',
  tags: [
    'Action',
    'Adventure',
    'Multiplayer',
    'Singleplayer',
    'Indie',
    'RPG',
  ],
  images: [
    {
      url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg',
      priority: 10,
      flags: 16 | 2
    }
  ],
  description: [
    {
      lang: 'en-US',
      text: 'The Legend is Back - Return to the Valley of the Mines in this faithful remake of the genre-defining classic RPG. Explore a hand-crafted, organic open world that reacts dynamically to your actions in a gritty, unrestricted experience like no other.'.trim()
    },
    {
      lang: 'de-DE',
      text: 'de-DE ipsum '.repeat(1 + Math.random() * 10).trim()
    }
  ],
  rating: Math.floor(Math.random() * 100) / 100,
  until: Math.floor(Date.now() + Math.random() * 400000),
  type: 'other',
  urls: [
    {
      url: 'https://store.steampowered.com/app/123456/Test_Product/',
      priority: 10,
      flags: 1 | 8,
      store: 'steam',
      platforms: ['windows']
    }
  ],
  store: 'steam',
  platforms: ['windows'],
  flags: 0,
  notice: 'This is a notice provided by a team member.',
  meta: [
    { key: 'scraper.version', value: '1.0.0' },
  ],
  staffApproved: false,
  copyright: 'FreeStuff Services Inc.',
});

import app from './server';

app.get('/test', async (c) => {
  await sendToAll([testProduct]);
  return c.text('Test product sent to all channels');
});

export default app;