// Locale-aware date formatting. UI language ('sq' | 'en') maps to a BCP-47
// locale; anything unknown falls back to English.
const LOCALE_MAP = { sq: 'sq-AL', en: 'en-GB' }

export function dateLocale(locale) {
    return LOCALE_MAP[locale] || LOCALE_MAP.en
}

export function formatDateTime(value, locale, options) {
    if (!value) return ''
    return new Date(value).toLocaleString(dateLocale(locale), options ?? {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

export function formatDate(value, locale, options) {
    if (!value) return ''
    return new Date(value).toLocaleDateString(dateLocale(locale), options)
}
