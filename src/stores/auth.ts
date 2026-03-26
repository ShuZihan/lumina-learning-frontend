import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getApiUrl } from '../utils/api'

export interface User {
  id: string
  openid: string
  provider: string
  nickname: string | null
  avatar: string | null
  role: 'guest' | 'user' | 'admin'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))

  // 从缓存恢复用户信息，避免刷新时出现短暂空白
  const cachedUser = localStorage.getItem('user')
  const user = ref<User | null>(cachedUser ? JSON.parse(cachedUser) : null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isGuest = computed(() => !token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const resp = await fetch(getApiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      if (resp.ok) {
        user.value = await resp.json()
        localStorage.setItem('user', JSON.stringify(user.value))
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 初始化时如果有 token 就在后台静默刷新用户信息
  if (token.value) {
    fetchUser()
  }

  return { token, user, isAuthenticated, isAdmin, isGuest, setToken, fetchUser, logout }
})
