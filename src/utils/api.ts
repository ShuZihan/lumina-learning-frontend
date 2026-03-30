import { StorageKeys, getItem } from './storage'

/**
 * API基础配置，自动适配开发/生产环境
 * 开发环境：走Vite代理到本地后端
 * 生产环境：直接调用环境变量配置的后端地址
 */
const isDev = import.meta.env.DEV
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const getApiUrl = (path: string): string => {
  // 统一去掉路径开头可能存在的/api前缀和斜杠
  const cleanPath = path.replace(/^\/?api\/?/, '').replace(/^\/+/, '')
  // 统一加上/api前缀
  const normalizedPath = `/api/${cleanPath}`

  if (isDev) {
    // 开发环境走相对路径，用Vite代理
    return normalizedPath
  } else {
    // 生产环境直接拼接完整后端地址
    return `${apiBaseUrl}${normalizedPath}`
  }
}

export const getAuthHeaders = (): Record<string, string> => {
  const token = getItem<string>(StorageKeys.TOKEN)
  return token ? { Authorization: `Bearer ${token}` } : {}
}
