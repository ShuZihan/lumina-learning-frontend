/**
 * 统一本地存储管理
 * 所有 localStorage 操作都通过此模块，避免散落在各处
 */

const NAMESPACE = 'lumina'

function getKey(key: string): string {
  return `${NAMESPACE}:${key}`
}

/**
 * 所有存储键名集中管理
 */
export const StorageKeys = {
  TOKEN: 'token',
  USER: 'user',
  LANG: 'lang',
  SIDEBAR_COLLAPSED: 'sidebar:collapsed',
  RESOURCES_CACHE_PUBLIC: 'resources:cache:public',
  RESOURCES_CACHE_TIME_PUBLIC: 'resources:cache_time:public',
  RESOURCES_CACHE_PERSONAL: 'resources:cache:personal',
  RESOURCES_CACHE_TIME_PERSONAL: 'resources:cache_time:personal',
} as const

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys]

/**
 * 获取存储项（带类型安全）
 */
export function getItem<T>(key: StorageKey): T | null
export function getItem<T>(key: StorageKey, defaultValue: T): T
export function getItem<T>(key: StorageKey, defaultValue?: T): T | null {
  try {
    const value = localStorage.getItem(getKey(key))
    if (value === null) return defaultValue ?? null
    return JSON.parse(value) as T
  } catch {
    return defaultValue ?? null
  }
}

/**
 * 设置存储项（自动序列化）
 */
export function setItem<T>(key: StorageKey, value: T): void {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value))
  } catch {
    // 忽略存储失败（如隐私模式）
  }
}

/**
 * 移除存储项
 */
export function removeItem(key: StorageKey): void {
  localStorage.removeItem(getKey(key))
}

/**
 * 清空所有 lumina 命名空间的数据
 */
export function clearAll(): void {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(`${NAMESPACE}:`)) {
      localStorage.removeItem(key)
    }
  })
}

/**
 * 监听存储变化（跨标签页同步）
 * @returns 取消监听的函数
 */
export function onStorageChange<T>(key: StorageKey, callback: (value: T | null) => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === getKey(key)) {
      try {
        const value = e.newValue ? JSON.parse(e.newValue) : null
        callback(value)
      } catch {
        callback(null)
      }
    }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
