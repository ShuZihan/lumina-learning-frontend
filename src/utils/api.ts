import { StorageKeys, getItem } from './storage'

/**
 * API基础配置，自动适配开发/生产环境
 * 开发环境：走Vite代理到本地后端
 * 生产环境：直接调用环境变量配置的后端地址
 */
const isDev = import.meta.env.DEV
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const getApiUrl = (path: string): string => {
  if (isDev) {
    // 开发环境走相对路径，用Vite代理
    return path
  } else {
    // 生产环境直接拼接完整后端地址
    return `${apiBaseUrl}${path}`
  }
}

export const getAuthHeaders = (): Record<string, string> => {
  const token = getItem<string>(StorageKeys.TOKEN)
  return token ? { Authorization: `Bearer ${token}` } : {}
}
