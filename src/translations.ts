const TRANSLATIONS_BASE_URL = 'https://raw.githubusercontent.com/FreeStuffBot/translations/main/discord-bot'
const CACHE_TTL_MS = 6 * 60 * 60 * 1000

type TranslationKey =
  | 'announcement_button_text'
  | 'announcement_footer'
  | 'open_in_browser'
  | 'cmd_free_until'
  | 'subscription_timed_name'
  | 'subscription_other_name'
  | 'subscription_assets_name'
  | 'subscription_mobile_name'
  | 'announcement_pricetag_free'
  | 'announcement_price_generic'
  | 'announcement_price_generic_until'
  | 'announcement_price_timed'
  | 'announcement_price_timed_until'
  | 'announcement_price_other'
  | 'announcement_price_other_until'
  | 'announcement_price_keep'
  | 'announcement_price_keep_until'
  | 'announcement_price_mobile'
  | 'announcement_price_mobile_until'
  | 'announcement_price_assets'
  | 'announcement_price_assets_until'

type CacheEntry = {
  fetchedAt: number
  values: Record<string, string>
  exists: boolean
}

const DEFAULT_TRANSLATIONS: Record<TranslationKey, string> = {
  announcement_button_text: 'Get it for free',
  announcement_footer: 'via {website}',
  open_in_browser: 'Open in browser',
  cmd_free_until: 'until',
  subscription_timed_name: 'Free Weekend',
  subscription_other_name: 'DLCs & More',
  subscription_assets_name: 'Gamedev Assets',
  subscription_mobile_name: 'Mobile Games',
  announcement_pricetag_free: 'Free',
  announcement_price_generic: '{prices}',
  announcement_price_generic_until: '{prices} until {date}',
  announcement_price_timed: '**Free to play**',
  announcement_price_timed_until: '**Free to play** until {date}',
  announcement_price_other: '{prices}',
  announcement_price_other_until: '{prices} until {date}',
  announcement_price_keep: '{prices}',
  announcement_price_keep_until: '{prices} until {date}',
  announcement_price_mobile: '**Free on mobile**',
  announcement_price_mobile_until: '**Free on mobile** until {date}',
  announcement_price_assets: '{prices}',
  announcement_price_assets_until: '{prices} until {date}',
}

const cache = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<CacheEntry>>()

function toCanonicalLocale(locale: string): string {
  return locale.trim().replace('_', '-')
}

function localeCandidates(locale: string): string[] {
  const canonical = toCanonicalLocale(locale)
  const [language] = canonical.split('-')
  const candidates = [canonical]

  if (language && language !== canonical) {
    candidates.push(language)
  }

  candidates.push('en-US')

  return [...new Set(candidates)]
}

function parseJsonc(raw: string): Record<string, unknown> {
  const withoutLineComments = raw.replace(/^\s*\/\/.*$/gm, '')
  return JSON.parse(withoutLineComments) as Record<string, unknown>
}

function markdownBoldToTelegramHtml(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
}

function renderTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`)
}

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS
}

async function fetchLocale(locale: string): Promise<CacheEntry> {
  const url = `${TRANSLATIONS_BASE_URL}/${encodeURIComponent(locale)}.jsonc`
  const response = await fetch(url)

  if (response.status === 404) {
    return {
      fetchedAt: Date.now(),
      values: {},
      exists: false,
    }
  }

  if (!response.ok) {
    throw new Error(`Translation fetch failed for ${locale}: HTTP ${response.status}`)
  }

  const parsed = parseJsonc(await response.text())
  const values: Record<string, string> = {}

  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === 'string') {
      values[key] = value
    }
  }

  return {
    fetchedAt: Date.now(),
    values,
    exists: true,
  }
}

async function ensureLocaleLoaded(locale: string): Promise<CacheEntry> {
  const existing = cache.get(locale)
  if (existing && isFresh(existing)) {
    return existing
  }

  const running = inFlight.get(locale)
  if (running) {
    return running
  }

  const promise = fetchLocale(locale)
    .then((entry) => {
      cache.set(locale, entry)
      return entry
    })
    .catch((error) => {
      console.warn(`Failed to refresh translations for ${locale}:`, error)
      const stale = cache.get(locale)
      if (stale) {
        return stale
      }
      return {
        fetchedAt: Date.now(),
        values: {},
        exists: false,
      }
    })
    .finally(() => {
      inFlight.delete(locale)
    })

  inFlight.set(locale, promise)
  return promise
}

async function getRawTranslation(locale: string, key: TranslationKey): Promise<string> {
  for (const candidate of localeCandidates(locale)) {
    const entry = await ensureLocaleLoaded(candidate)
    if (!entry.exists) {
      continue
    }

    const translated = entry.values[key]
    if (typeof translated === 'string' && translated.length > 0) {
      return translated
    }
  }

  return DEFAULT_TRANSLATIONS[key]
}

export async function translate(
  locale: string,
  key: TranslationKey,
  vars: Record<string, string> = {},
): Promise<string> {
  const raw = await getRawTranslation(locale, key)
  return markdownBoldToTelegramHtml(renderTemplate(raw, vars))
}

export async function warmTranslations(locales: string[]): Promise<void> {
  const allCandidates = new Set<string>()

  for (const locale of locales) {
    for (const candidate of localeCandidates(locale)) {
      allCandidates.add(candidate)
    }
  }

  await Promise.all([...allCandidates].map((locale) => ensureLocaleLoaded(locale)))
}