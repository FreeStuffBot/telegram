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
    timeStyle: 'short'
  });
  const untilString = product.until
    ? `until ${untilFormatter.format(product.until)}`
    : '';

  let statusString = `<s>${priceString}</s> <b>FREE</b>`;

  const extra: string[] = [];
  if (product.rating !== undefined && product.rating >= 0) {
    extra.push(`${Math.round(product.rating * 50) / 10}/5 ★`);
  }
  switch (product.type) {
    case 'timed':
      statusString = 'Free Weekend';
      break;
    case 'other':
      extra.push('DLC / Addon');
      break;
    case 'mobile':
      extra.push('Mobile Game');
      break;
  }
  if (product.platforms.length === 1) {
    extra.push(product.platforms[0][0].toUpperCase() + product.platforms[0].slice(1));    
  }

  return sendMessage({
    to,
    text: [
      `<b>${product.title}</b>`,
      `<i>${product.description}</i>`,
      '',
      `${statusString} ${untilString}`,
      extra.length ? extra.map(e => `<b>${e}</b>`).join(' — ') : null,
      '',
      `via <a href="https://freestuffbot.xyz/">freestuffbot.xyz</a>`
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

export { default } from './server';
