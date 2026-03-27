import { createI18n } from 'vue-i18n'

// 预加载默认语言（zh-CN），避免首屏闪烁
import zhCN from './locales/zh-CN.json'

function detectLocale(): string {
  const saved = localStorage.getItem('lumina-lang')
  if (saved === 'zh-CN' || saved === 'en-US') return saved

  const lang = navigator.language || 'zh-CN'
  if (lang.startsWith('zh')) return 'zh-CN'
  return 'en-US'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
  },
})

const loadedLocales = new Set<string>(['zh-CN'])

// 一期：从 JSON 文件懒加载（构建时自动 code-split）
// 二期迁移只需替换此函数为 fetch('/api/i18n/${locale}')，组件代码无需改动
async function loadLocaleMessages(locale: string) {
  if (loadedLocales.has(locale)) return
  const messages = await import(`./locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, messages.default)
  loadedLocales.add(locale)
}

export async function setLocale(lang: string) {
  await loadLocaleMessages(lang)
  ;(i18n.global.locale as any).value = lang
  localStorage.setItem('lumina-lang', lang)
}

// 初始化：若检测到非 zh-CN 语言，懒加载对应翻译
const initialLocale = detectLocale()
if (initialLocale !== 'zh-CN') {
  setLocale(initialLocale)
}
