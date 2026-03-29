import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getApiUrl } from '../utils/api'
import { StorageKeys, getItem, setItem, removeItem } from '../utils/storage'

export interface User {
  id: string
  openid: string
  provider: string
  nickname: string | null
  avatar: string | null
  role: 'guest' | 'user' | 'admin'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getItem(StorageKeys.TOKEN))

  // 从缓存恢复用户信息，避免刷新时出现短暂空白
  const cachedUser = getItem<User>(StorageKeys.USER)
  const user = ref<User | null>(cachedUser)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isGuest = computed(() => !token.value)

  function setToken(newToken: string) {
    token.value = newToken
    setItem(StorageKeys.TOKEN, newToken)
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const resp = await fetch(getApiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      if (resp.ok) {
        user.value = await resp.json()
        setItem(StorageKeys.USER, user.value)
      } else {
        logout()
      }
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    removeItem(StorageKeys.TOKEN)
    removeItem(StorageKeys.USER)
    // 退出登录时清理资源缓存
    removeItem(StorageKeys.RESOURCES_CACHE)
    removeItem(StorageKeys.RESOURCES_CACHE_TIME)
  }

  // 初始化时如果有 token 就在后台静默刷新用户信息
  if (token.value) {
    fetchUser()
  }

  return { token, user, isAuthenticated, isAdmin, isGuest, setToken, fetchUser, logout }
})
