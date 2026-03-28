import { createI18n, I18n } from 'vue-i18n'

// 预加载默认语言（zh-CN），体积极小直接打包
import zhCN from './locales/zh-CN.json'

const loadedLocales = new Set<string>(['zh-CN'])
let i18nInstance: I18n | null = null

/**
 * 检测用户当前语言
 */
export function detectLocale(): string {
  const saved = localStorage.getItem('lumina-lang')
  if (saved === 'zh-CN' || saved === 'en-US') return saved

  const lang = navigator.language || 'zh-CN'
  if (lang.startsWith('zh')) return 'zh-CN'
  return 'en-US'
}

/**
 * 加载指定语言的翻译包
 * 一期：从本地JSON动态导入（自动code-split）
 * 二期迁移只需修改此函数为API请求即可，上层逻辑无需改动
 */
async function loadLocaleMessages(locale: string): Promise<Record<string, string>> {
  if (locale === 'zh-CN') return zhCN
  const messages = await import(`./locales/${locale}.json`)
  return messages.default
}

/**
 * 切换语言
 */
export async function setLocale(lang: string) {
  if (!i18nInstance) throw new Error('i18n not initialized')
  if (loadedLocales.has(lang)) {
    ;(i18nInstance.global.locale as any).value = lang
    localStorage.setItem('lumina-lang', lang)
    return
  }
  const messages = await loadLocaleMessages(lang)
  i18nInstance.global.setLocaleMessage(lang, messages)
  loadedLocales.add(lang)
  ;(i18nInstance.global.locale as any).value = lang
  localStorage.setItem('lumina-lang', lang)
}

/**
 * 异步初始化i18n：确保首屏渲染时已经加载好对应语言的翻译，彻底解决闪烁问题
 */
export async function initI18n(): Promise<I18n> {
  const locale = detectLocale()
  const messages: Record<string, any> = { 'zh-CN': zhCN }

  // 非中文用户，先加载对应语言翻译再初始化
  if (locale !== 'zh-CN') {
    const langMessages = await loadLocaleMessages(locale)
    messages[locale] = langMessages
    loadedLocales.add(locale)
  }

  i18nInstance = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'zh-CN',
    messages,
  })

  return i18nInstance
}

/**
 * 获取i18n实例（仅在初始化完成后调用）
 */
export function getI18n(): I18n {
  if (!i18nInstance) throw new Error('i18n not initialized')
  return i18nInstance
}
